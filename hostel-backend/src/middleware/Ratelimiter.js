// middlewares/rateLimiter.js

import { redis } from "../config/redis.js";

export const rateLimiter = ({ window = 60, limit = 5 }) => {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;

      const key = `rate:${identifier}:${req.route.path}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, window);
      }

      if (count > limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Try later."
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(); // don't block app
    }
  };
};