import "dotenv/config";
import { redis } from "./src/config/redis.js";

async function test() {
  console.log("Connecting to Redis...");
  try {
    const res = await redis.set("test-key", "123", "EX", 10);
    console.log("Set result:", res);
    const val = await redis.get("test-key");
    console.log("Get result:", val);
    process.exit(0);
  } catch (err) {
    console.error("Error!!!", err);
    process.exit(1);
  }
}
test();
