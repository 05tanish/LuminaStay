import { redis } from "../../config/redis.js";
import { AppError } from "../../utils/AppError.js";
import crypto from "crypto";
import { logger } from "../../utils/logger.js";
import { sendOtpEmail } from "../../utils/Email.Service.js";

export const sendOtpService = async (email) => {
  try {
    const cooldownKey = `otp:cooldown:${email}`;
    const otpKey = `otp:${email}`;

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
    logger.debug("OTP generated and stored", { email });
    
    // 📩 Send via Email Service with professional template
    await sendOtpEmail({ email, otp });

    return true;
  } catch (error) {
    logger.error("OTP Service Error", { email, error: error.message });

    // ✅ If it's already AppError → rethrow as is
    if (error instanceof AppError) {
      throw error;
    }

    // 🔥 Only wrap unknown errors
    throw new AppError("Failed to send OTP. Try again later.", 503);
  }
};