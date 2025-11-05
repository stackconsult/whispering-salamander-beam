interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Simple in-memory rate limiter (for production, use Redis or similar)
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  // Clean up old entries
  if (record && now > record.resetTime) {
    delete rateLimitStore[identifier];
  }

  // Initialize or get current record
  const currentRecord = rateLimitStore[identifier] || {
    count: 0,
    resetTime: now + windowMs,
  };

  // Check if limit exceeded
  if (currentRecord.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    };
  }

  // Increment counter
  currentRecord.count++;
  rateLimitStore[identifier] = currentRecord;

  return {
    allowed: true,
    remaining: maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  };
}

// Helper to get client IP from request headers
import type { VercelRequest } from '@vercel/node';

export function getClientIp(req: VercelRequest): string {
  const headers = req.headers as Record<string, string | string[] | undefined>;
  const xff = headers['x-forwarded-for'];
  const xri = headers['x-real-ip'];

  const forwarded = Array.isArray(xff) ? xff[0] : xff;
  const realIp = Array.isArray(xri) ? xri[0] : xri;

  const ip =
    forwarded?.split(',')[0]?.trim() ||
    realIp ||
  req.socket?.remoteAddress ||
    'unknown';

  return ip;
}
