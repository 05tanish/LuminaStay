import axios from "axios";
import { redis } from "../../config/redis.js";
import AppError from "../../utils/AppError.js";
import crypto from "crypto";

export const sendOtpService = async (phone) => {
  try {
  const cooldownKey = `otp:cooldown:${phone}`;
  const otpKey = `otp:${phone}`;

  // 🚫 Check cooldown (60 sec)
  const cooldown = await redis.get(cooldownKey);
  if (cooldown) {
    throw new AppError("Please wait before requesting OTP again", 429);
  }

const otp = Math.floor(100000 + Math.random() * 900000).toString();

const hashedOtp = crypto
  .createHash("sha256")
  .update(otp)
  .digest("hex");

await redis.set(otpKey, hashedOtp, "EX", 300);

  // ✅ Set cooldown (60 sec)
  await redis.set(cooldownKey, "1", "EX", 60);

  // 📩 Send via MSG91
  await axios.post(
    "https://control.msg91.com/api/v5/flow/",
    {
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: "0",
      recipients: [
        {
          mobiles: `91${phone}`,
          OTP: otp
        }
      ]
    },
    {
      headers: {
        authkey: process.env.MSG91_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  return true;
} catch (error) {
    console.error("OTP Service Error:", error);

    // 🔥 FAIL GRACEFULLY
    throw new AppError("Failed to send OTP. Try again later.", 503);
  }
};