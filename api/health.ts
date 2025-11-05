import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const provider = process.env.LLM_PROVIDER || 'openai';
  const hasHF = Boolean(process.env.HUGGINGFACE_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  res.status(200).json({
    ok: true,
    provider,
    huggingface: { configured: hasHF, model: process.env.HUGGINGFACE_MODEL || null },
    openai: { configured: hasOpenAI, model: process.env.OPENAI_MODEL || null },
  });
}
