import Redis from "ioredis";
import { logger } from "../utils/logger.js";

export const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL, {
  tls: {}
});

// Connection event handlers
redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error("Redis connection error", { error: err.message }));