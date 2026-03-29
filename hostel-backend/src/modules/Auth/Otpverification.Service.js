import { prisma } from "../../config/db.js";
import crypto from "crypto";
import redis from "../../config/redis.js";
import AppError from "../../utils/AppError.js";

export const verifyOtpService = async (phone, code) => {
  try {
    const otpKey = `otp:${phone}`;
    const attemptKey = `otp:attempt:${phone}`;

    const storedOtp = await redis.get(otpKey);

    const hashedInput = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    if (storedOtp !== hashedInput) {
      throw new AppError("Invalid OTP", 400);
    }

    // 🔥 Track attempts
    const attempts = await redis.incr(attemptKey);

    if (attempts === 1) {
      await redis.expire(attemptKey, 300); // same as OTP expiry
    }

    if (attempts > 5) {
      throw new AppError("Too many attempts. Try later", 429);
    }

    if (storedOtp !== code) {
      throw new AppError("Invalid OTP", 400);
    }

    // ✅ Success → cleanup
    await redis.del(otpKey);
    await redis.del(attemptKey);

    // ✅ Mark verified
    await prisma.user.update({
      where: { phone },
      data: { phoneVerified: true }
    });

    return true;
  } catch (error) {
    console.error("Redis/OTP Error:", error);

    // 🔥 FAIL GRACEFULLY
    throw new AppError("OTP service temporarily unavailable", 503);
  }
};