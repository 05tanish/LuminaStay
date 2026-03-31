// Rate limiter middleware — Redis-backed sliding window rate limiting.
// Applied to auth routes to prevent brute-force attacks and abuse.

import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";

/**
 * Creates a rate limiter middleware with configurable window and limit.
 *
 * @param {object} options
 * @param {number} options.window  — Time window in seconds (default: 60)
 * @param {number} options.limit   — Max requests per window (default: 5)
 * @param {string} options.message — Custom error message (optional)
 *
 * Rate limit strategy:
 * - IP-based for unauthenticated routes (login, register)
 * - User ID-based for authenticated routes (prevents abuse after login)
 * - Uses Redis INCR + EXPIRE for atomic counter with auto-cleanup
 */
export const rateLimiter = ({ window = 60, limit = 5, message = "Too many requests. Try later." }) => {
  return async (req, res, next) => {
    try {
      // Use user ID if available (authenticated), otherwise fall back to IP
      const identifier = req.user?.id || req.ip;

      // Use the full URL path for rate limit scope — req.route.path is unreliable
      // because it only contains the route pattern (e.g. "/") not the full path
      const key = `rate:${identifier}:${req.originalUrl}`;

      const count = await redis.incr(key);

      // Set TTL only on the first request in the window.
      // Subsequent requests just increment the counter.
      if (count === 1) {
        await redis.expire(key, window);
      }

      // Get remaining TTL for response headers
      const ttl = await redis.ttl(key);

      // Set standard rate limit headers — helps clients implement backoff
      res.set({
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(Math.max(0, limit - count)),
        'X-RateLimit-Reset': String(ttl)
      });

      if (count > limit) {
        // Add Retry-After header (RFC 7231) — tells clients how long to wait
        res.set('Retry-After', String(ttl));

        logger.warn("Rate limit exceeded", {
          ip: req.ip,
          url: req.originalUrl,
          identifier
        });

        return res.status(429).json({
          success: false,
          message
        });
      }

      next();
    } catch (err) {
      // If Redis is down, allow the request through — don't block the entire app
      // because of a rate limiter failure. Log it for monitoring.
      logger.error("Rate limiter error", { error: err.message });
      next();
    }
  };
};