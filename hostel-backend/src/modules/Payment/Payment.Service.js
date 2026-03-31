// Added pagination to payment list endpoints
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

  //  Verify the fee belongs to the requesting user
  if (fee.userId !== userId) {
    throw new AppError("You can only pay your own fees", 403);
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: fee.amount * 100,
    currency: "INR",
    receipt: `receipt_${fee.id}`
  });

  // Check existing payment
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

  //  Use transaction for atomicity — both payment record and fee status
  // must be updated together or not at all
  await prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUnique({
      where: { monthlyFeeId }
    });

    if (existing) {
      await tx.payment.update({
        where: { id: existing.id },
        data: {
          status: "PAID",
          mode: "CASH",
          collectedByAdminId: adminId,
          remarks
        }
      });
    } else {
      await tx.payment.create({
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

    await tx.monthlyFee.update({
      where: { id: monthlyFeeId },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });
  });

  return true;
};

//  Added pagination
export const getUserPaymentHistoryService = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      include: {
        monthlyFee: true
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    }),
    prisma.payment.count({ where: { userId } })
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

//  Added pagination
export const getAllPaymentsService = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
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
      },
      skip,
      take: limit
    }),
    prisma.payment.count()
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};