import Redis from "ioredis";

export const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL, {
  tls: {}
});

// Optional: debug
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error", err));