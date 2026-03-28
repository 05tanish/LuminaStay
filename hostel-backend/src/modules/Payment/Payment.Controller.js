import {asyncHandler} from "../../utils/asyncHandler.js";
import {createOrderService} from "./Payment.Service.js";
import {successResponse} from "../../utils/response.js";
import {prisma} from "../../config/db.js";



export const createOrder = asyncHandler(async (req, res) => {
  
    const { monthlyFeeId } = req.body;

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

  const payments = await getUserPaymentHistoryService(req.user.id);

  return successResponse(res, {
    statusCode: 200,
    message: "Payment history fetched",
    data: payments
  });
});
export const getAllPayments = asyncHandler(async (req, res) => {

  const payments = await getAllPaymentsService();

  return successResponse(res, {
    statusCode: 200,
    message: "All payments fetched",
    data: payments
  });
});