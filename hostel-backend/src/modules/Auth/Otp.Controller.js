 import {asyncHandler} from "../../utils/asyncHandler.js";
import AppError from "../../utils/AppError.js";
import { sendOtpService } from "./Sendotp.Service.js";
import { successResponse } from "../../utils/response.js";

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