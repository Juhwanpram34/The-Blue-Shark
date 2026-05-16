// Simple in-memory rate limiter (resets on cold start)
// For production, consider using Upstash Redis

const rateLimits = {};
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(rateLimits)) {
    if (now - rateLimits[key].resetAt > 0) {
      delete rateLimits[key];
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limiter
 * @param {string} key - Unique identifier (e.g., userId or IP)
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function rateLimit(key, maxRequests = 10, windowMs = 60 * 1000) {
  const now = Date.now();

  if (!rateLimits[key] || now > rateLimits[key].resetAt) {
    rateLimits[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return { allowed: true, remaining: maxRequests - 1, resetAt: rateLimits[key].resetAt };
  }

  rateLimits[key].count += 1;

  if (rateLimits[key].count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: rateLimits[key].resetAt,
      retryAfter: Math.ceil((rateLimits[key].resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - rateLimits[key].count,
    resetAt: rateLimits[key].resetAt,
  };
}

/**
 * Rate limit configurations per endpoint
 */
export const RATE_LIMITS = {
  chat: { maxRequests: 15, windowMs: 60 * 1000 },        // 15 req/min
  collaborate: { maxRequests: 5, windowMs: 60 * 1000 },   // 5 req/min
  generateImage: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 req/min
  telegram: { maxRequests: 20, windowMs: 60 * 1000 },     // 20 req/min
  notify: { maxRequests: 5, windowMs: 60 * 1000 },        // 5 req/min
};

/**
 * Apply rate limit to API handler
 * @param {object} req - Next.js request
 * @param {object} res - Next.js response
 * @param {string} endpoint - Endpoint name (from RATE_LIMITS)
 * @returns {boolean} - true if allowed, false if rate limited (response already sent)
 */
export function applyRateLimit(req, res, endpoint) {
  const config = RATE_LIMITS[endpoint] || { maxRequests: 10, windowMs: 60000 };
  
  // Use user ID from body, auth header, or IP
  const userId = req.body?.userId || req.headers['x-user-id'] || 'anon';
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const key = `${endpoint}:${userId}:${ip}`;

  const result = rateLimit(key, config.maxRequests, config.windowMs);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.maxRequests);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

  if (!result.allowed) {
    res.status(429).json({
      error: 'Too many requests',
      message: `Terlalu banyak request. Coba lagi dalam ${result.retryAfter} detik.`,
      retryAfter: result.retryAfter,
    });
    return false;
  }

  return true;
}
