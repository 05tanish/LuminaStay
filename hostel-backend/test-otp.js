import "dotenv/config";
import { sendOtpService } from "./src/modules/Auth/Sendotp.Service.js";

async function test() {
  console.log("Calling sendOtpService...");
  try {
    const res = await sendOtpService("test3@example.com");
    console.log("Service completed with result:", res);
    process.exit(0);
  } catch (err) {
    console.error("Service error:", err.message);
    process.exit(1);
  }
}
test();
