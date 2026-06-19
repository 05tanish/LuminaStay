import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { AppError } from "../../utils/AppError.js";
import {
  createOrderService,
  cashPaymentService,
  getUserPaymentHistoryService,
  getAllPaymentsService,
  getRevenueByHostelService,
  getPlatformRevenueService,
  verifyPaymentSignatureService
} from "./Payment.Service.js";



export const createOrder = asyncHandler(async (req, res) => {
  const { monthlyFeeId } = req.body;

  if (!monthlyFeeId) {
    throw new AppError("monthlyFeeId is required", 400);
  }

  const order = await createOrderService({
    userId: req.user.id,
    monthlyFeeId
  });

  return successResponse(res, {
    statusCode: 200,
    message: "Order created",
    data: order
  });
});

export const cashPayment = asyncHandler(async (req, res) => {
  const { userId, monthlyFeeId, remarks } = req.body;

  if (!userId || !monthlyFeeId) {
    throw new AppError("userId and monthlyFeeId required", 400);
  }

  await cashPaymentService({
    userId,
    monthlyFeeId,
    adminId: req.user.id,
    remarks
  });

  return successResponse(res, {
    statusCode: 200,
    message: "Cash payment recorded successfully"
  });
});


export const getUserPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await getUserPaymentHistoryService(req.user.id, page, limit);

  return successResponse(res, {
    statusCode: 200,
    message: "Payment history fetched",
    data: result
  });
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await getAllPaymentsService(page, limit, req.user.id, req.user.role);

  return successResponse(res, {
    statusCode: 200,
    message: "All payments fetched",
    data: result
  });
});

export const getRevenue = asyncHandler(async (req, res) => {
  let revenue = { totalRevenue: 0 };

  if (req.user.role === "SUPER_ADMIN") {
    revenue = await getPlatformRevenueService(req.user.id, req.user.role);
  } else if (req.user.role === "ADMIN" && req.user.hostelId) {
    revenue = await getRevenueByHostelService(req.user.hostelId, req.user.id, req.user.role);
  }

  return successResponse(res, {
    statusCode: 200,
    message: "Revenue fetched successfully",
    data: revenue
  });
});

export const verifyOrder = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, monthlyFeeId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !monthlyFeeId) {
    throw new AppError("razorpayOrderId, razorpayPaymentId, razorpaySignature, and monthlyFeeId are required", 400);
  }

  await verifyPaymentSignatureService({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    monthlyFeeId
  });

  return successResponse(res, {
    statusCode: 200,
    message: "Payment verified successfully"
  });
});