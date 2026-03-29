import { asyncHandler } from "../../utils/asyncHandler.js";
import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { sendOtpService } from "../Auth/Sendotp.Service.js";

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new AppError("Phone required", 400);
  }

  await sendOtpService(phone);

  return successResponse(res, {
    statusCode: 200,
    message: "OTP sent successfully"
  });
});