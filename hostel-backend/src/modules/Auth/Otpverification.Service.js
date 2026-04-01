//  Three critical bugs fixed:
// 1. `import redis from` (default import) but redis.js exports named `{ redis }`
// 2. Attempt tracking happened AFTER the first OTP comparison — should be BEFORE
//    so rate limiting works even when the OTP is wrong
// 3. catch block swallowed original AppError (converting 400→503), masking real errors
import { prisma } from "../../config/db.js";
import crypto from "crypto";
//  Changed from default import to named import
import { redis } from "../../config/redis.js";
import AppError from "../../utils/AppError.js";

export const verifyOtpService = async (email, code) => {
  // 🔥 Allow mock OTP bypass in development only
  if (process.env.NODE_ENV === "development" && code === "123456") {
    return true;
  }

  const otpKey = `otp:${email}`;
  const attemptKey = `otp:attempt:${email}`;

  //  Track attempts FIRST, before comparing OTP.
  // This prevents brute-force attacks even when guessing wrong OTPs.
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

  // We DO NOT update `prisma.user` here because the user might not exist yet during registration.
  // The caller is responsible for creating/updating the user with `phoneVerified: true`.

  return true;
};