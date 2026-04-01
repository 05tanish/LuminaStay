import { asyncHandler } from "../../utils/AsyncHandler.js";
import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { sendOtpService } from "../Auth/Sendotp.Service.js";

export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email required", 400);
  }

  await sendOtpService(email);

  return successResponse(res, {
    statusCode: 200,
    message: "OTP sent successfully"
  });
});