import { redis } from "../../config/redis.js";
import AppError from "../../utils/AppError.js";
import crypto from "crypto";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 📩 Send via Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Default test email for Resend
      to: email,
      subject: 'Your Verification Code',
      html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
    });

    return true;
  } catch (error) {
    console.error("OTP Service Error:", error);

    // ✅ If it's already AppError → rethrow as is
    if (error instanceof AppError) {
      throw error;
    }

    // 🔥 Only wrap unknown errors
    throw new AppError("Failed to send OTP. Try again later.", 503);
  }
};