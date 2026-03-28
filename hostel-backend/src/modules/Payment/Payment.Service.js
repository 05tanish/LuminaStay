// services/payment.service.js

import { prisma } from "../../config/db.js";
import { razorpay } from "../../config/razorpay.js";
import AppError from "../../utils/AppError.js";

export const createOrderService = async ({ userId, monthlyFeeId }) => {

  const fee = await prisma.monthlyFee.findUnique({
    where: { id: monthlyFeeId }
  });

  if (!fee) throw new AppError("Fee not found", 404);

  if (fee.status === "PAID") {
    throw new AppError("Already paid", 400);
  }

  // 🔥 Create Razorpay order
  const order = await razorpay.orders.create({
    amount: fee.amount * 100,
    currency: "INR",
    receipt: `receipt_${fee.id}`
  });

  // 🔥 Check existing payment
  const existing = await prisma.payment.findUnique({
    where: { monthlyFeeId }
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        razorpayOrderId: order.id
      }
    });
  } else {
    await prisma.payment.create({
      data: {
        userId,
        monthlyFeeId,
        amount: fee.amount,
        mode: "ONLINE",
        razorpayOrderId: order.id
      }
    });
  }

  return order;
};

export const cashPaymentService = async ({
  userId,
  monthlyFeeId,
  adminId,
  remarks
}) => {

  const fee = await prisma.monthlyFee.findUnique({
    where: { id: monthlyFeeId }
  });

  if (!fee) {
    throw new AppError("Fee not found", 404);
  }

  if (fee.status === "PAID") {
    throw new AppError("Already paid", 400);
  }

  // check existing payment
  const existing = await prisma.payment.findUnique({
    where: { monthlyFeeId }
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        status: "PAID",
        mode: "CASH",
        collectedByAdminId: adminId,
        remarks
      }
    });
  } else {
    await prisma.payment.create({
      data: {
        userId,
        monthlyFeeId,
        amount: fee.amount,
        mode: "CASH",
        status: "PAID",
        collectedByAdminId: adminId,
        remarks
      }
    });
  }

  // update fee
  await prisma.monthlyFee.update({
    where: { id: monthlyFeeId },
    data: {
      status: "PAID",
      paidAt: new Date()
    }
  });

  return true;
};

export const getUserPaymentHistoryService = async (userId) => {

  return await prisma.payment.findMany({
    where: { userId },
    include: {
      monthlyFee: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getAllPaymentsService = async () => {

  return await prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      monthlyFee: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};