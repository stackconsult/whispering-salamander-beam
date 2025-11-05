import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, getClientIp } from './utils/rateLimit';

interface ValidateRequestBody {
  url: string;
  query: string;
  provider?: 'openai' | 'huggingface';
}

interface ValidateResponse {
  success: boolean;
  message: string;
  isValidLink: boolean;
  contentMatchesQuery: boolean;
  error?: string;
  provider?: string;
}

// URL validation helper
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Fetch content from URL
async function fetchUrlContent(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SourceValidator/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return { success: false, error: 'Unsupported content type. Only HTML and plain text are supported.' };
    }

    const html = await response.text();
    
    // Basic HTML cleanup - extract text content
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000); // Limit to 4000 chars to keep LLM context manageable

    return { success: true, content: textContent };
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === 'AbortError') {
      return { success: false, error: 'Request timeout - URL took too long to respond' };
    }
    return { success: false, error: err.message || 'Failed to fetch URL' };
  }
}

// OpenAI validation
async function validateWithOpenAI(content: string, query: string): Promise<{ matches: boolean; reasoning: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const prompt = `You are a content validation assistant. Analyze if the following content is relevant to and matches the given query.

Query: "${query}"

Content: "${content}"

Respond in JSON format only:
{
  "matches": true/false,
  "reasoning": "Brief explanation of why the content does or doesn't match the query"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful content validation assistant. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const messageContent = data?.choices?.[0]?.message?.content ?? '{}';
  
  try {
    const result = JSON.parse(messageContent);
    return {
      matches: result.matches || false,
      reasoning: result.reasoning || 'No reasoning provided',
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      matches: false,
      reasoning: 'Failed to parse LLM response',
    };
  }
}

// Hugging Face validation
async function validateWithHuggingFace(content: string, query: string): Promise<{ matches: boolean; reasoning: string }> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY not configured');
  }

  const model = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
  
  const prompt = `You are a content validation assistant. Analyze if the following content is relevant to and matches the given query.

Query: "${query}"

Content: "${content}"

Respond in JSON format only:
{
  "matches": true/false,
  "reasoning": "Brief explanation"
}`;

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hugging Face API error: ${error}`);
  }

  type HFResponse = Array<{ generated_text?: string }> | { generated_text?: string };
  const data = (await response.json()) as HFResponse;
  const generatedText = Array.isArray(data)
    ? data[0]?.generated_text ?? '{}'
    : (data as { generated_text?: string }).generated_text ?? '{}';
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*"matches"[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        matches: result.matches || false,
        reasoning: result.reasoning || 'No reasoning provided',
      };
    }
    
    // Fallback: simple keyword matching
    const matchesKeywords = generatedText.toLowerCase().includes('true') || 
                           generatedText.toLowerCase().includes('matches') ||
                           generatedText.toLowerCase().includes('relevant');
    
    return {
      matches: matchesKeywords,
      reasoning: generatedText.slice(0, 200),
    };
  } catch {
    return {
      matches: false,
      reasoning: 'Failed to parse LLM response',
    };
  }
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, 10, 60000); // 10 requests per minute

    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        isValidLink: false,
        contentMatchesQuery: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const { url, query, provider } = req.body as ValidateRequestBody;

    // Validation
    if (!url || !query) {
      return res.status(400).json({
        success: false,
        message: 'URL and query are required',
        isValidLink: false,
        contentMatchesQuery: false,
        error: 'Missing required fields',
      } as ValidateResponse);
    }

    // Check URL format
    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format',
        isValidLink: false,
        contentMatchesQuery: false,
        error: 'Invalid URL format',
      } as ValidateResponse);
    }

    // Fetch content from URL
    const fetchResult = await fetchUrlContent(url);
    if (!fetchResult.success) {
      return res.status(200).json({
        success: false,
        message: fetchResult.error || 'Could not fetch URL content',
        isValidLink: false,
        contentMatchesQuery: false,
        error: fetchResult.error,
      } as ValidateResponse);
    }

    // Determine which LLM provider to use
    const selectedProvider = provider || (process.env.LLM_PROVIDER as 'openai' | 'huggingface') || 'openai';
    
    let validationResult: { matches: boolean; reasoning: string };
    
    try {
      if (selectedProvider === 'huggingface') {
        validationResult = await validateWithHuggingFace(fetchResult.content!, query);
      } else {
        validationResult = await validateWithOpenAI(fetchResult.content!, query);
      }
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(500).json({
        success: false,
        message: 'LLM validation failed',
        isValidLink: true,
        contentMatchesQuery: false,
        error: err.message,
        provider: selectedProvider,
      } as ValidateResponse);
    }

    // Return success response
    const message = validationResult.matches
      ? `Link is valid and content matches query! ${validationResult.reasoning}`
      : `Link is valid, but content does not match query. ${validationResult.reasoning}`;

    return res.status(200).json({
      success: true,
      message,
      isValidLink: true,
      contentMatchesQuery: validationResult.matches,
      provider: selectedProvider,
    } as ValidateResponse);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Validation error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during validation',
      isValidLink: false,
      contentMatchesQuery: false,
      error: err.message,
    } as ValidateResponse);
  }
}
