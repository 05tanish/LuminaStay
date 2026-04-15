import { asyncHandler } from "../../utils/AsyncHandler.js";
import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { sendOtpService } from "../Auth/Sendotp.Service.js";
import { verifyOtpService } from "../Auth/Otpverification.Service.js";
import { redis } from "../../config/redis.js";
import { logger } from "../../utils/logger.js";
import { validateEmail } from "../../utils/Email.Service.js";

export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  // Validate email format using the utility function
  if (!validateEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }

  logger.info("OTP send requested", { email });
  await sendOtpService(email);

  return successResponse(res, {
    statusCode: 200,
    message: "OTP sent successfully"
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    throw new AppError("Email and code are required", 400);
  }

  // Uses existing verification logic; throws AppError if incorrect
  await verifyOtpService(email, code);

  // Set the "verified" flag in Redis allowing registration to proceed. 
  // Stays active for 15 minutes.
  await redis.set(`email-verified:${email}`, "1", "EX", 900);

  return successResponse(res, {
    statusCode: 200,
    message: "Email verified successfully"
  });
});