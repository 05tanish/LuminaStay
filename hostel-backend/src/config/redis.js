import Redis from "ioredis";
import { logger } from "../utils/logger.js";

// Create a mock Redis client if no URL is provided or if connection fails
let redis;

if (process.env.UPSTASH_REDIS_REST_URL && 
    process.env.UPSTASH_REDIS_REST_URL !== 'disabled' &&
    process.env.UPSTASH_REDIS_REST_URL !== '') {
  try {
    redis = new Redis(process.env.UPSTASH_REDIS_REST_URL, {
      tls: {},
      connectTimeout: 10000,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn("Redis connection failed after 3 attempts, falling back to mock client");
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      },
      maxRetriesPerRequest: 3,
    });

    // Connection event handlers
    redis.on("connect", () => logger.info("Redis connected successfully"));
    redis.on("ready", () => logger.info("Redis ready to accept commands"));
    redis.on("error", (err) => {
      logger.error("Redis connection error", { error: err.message });
    });
    
    // Test connection
    redis.ping().catch(() => {
      logger.warn("Redis ping failed, using mock client");
      redis = createMockRedis();
    });
    
  } catch (error) {
    logger.warn("Redis initialization failed, using mock client", { error: error.message });
    redis = createMockRedis();
  }
} else {
  logger.info("Redis disabled or not configured, using mock client");
  redis = createMockRedis();
}

// Mock Redis client for when Redis is unavailable
function createMockRedis() {
  const mockData = new Map();
  return {
    get: async (key) => mockData.get(key) || null,
    set: async (key, value, ...args) => { mockData.set(key, value); return 'OK'; },
    setex: async (key, seconds, value) => { mockData.set(key, value); return 'OK'; },
    del: async (key) => { mockData.delete(key); return 1; },
    exists: async (key) => mockData.has(key) ? 1 : 0,
    expire: async (key, seconds) => 1,
    ttl: async (key) => -1,
    keys: async (pattern) => Array.from(mockData.keys()),
    flushall: async () => { mockData.clear(); return 'OK'; },
    ping: async () => 'PONG',
    quit: async () => 'OK',
    disconnect: () => {},
    on: () => {},
  };
}

export { redis };