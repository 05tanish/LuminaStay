
import { prisma } from "../../config/db.js";
import crypto from "crypto";
import { redis } from "../../config/redis.js";
import { AppError } from "../../utils/AppError.js";

export const verifyOtpService = async (email, code) => {
  // 🔥 Allow mock OTP bypass in development only
  if (process.env.NODE_ENV === "development" && code === "123456") {
    return true;
  }

  const otpKey = `otp:${email}`;
  const attemptKey = `otp:attempt:${email}`;

  const attempts = await redis.incr(attemptKey);

  if (attempts === 1) {
    await redis.expire(attemptKey, 300); // same as OTP expiry
  }

  if (attempts > 5) {
    throw new AppError("Too many attempts. Try later", 429);
  }

  const storedOtp = await redis.get(otpKey);

  if (!storedOtp) {
    throw new AppError("OTP expired or not found", 400);
  }

  const hashedInput = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  if (storedOtp !== hashedInput) {
    throw new AppError("Invalid OTP", 400);
  }

  //  Success → cleanup OTP and attempt counter
  await redis.del(otpKey);
  await redis.del(attemptKey);

  return true;
};