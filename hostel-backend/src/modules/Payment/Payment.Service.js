import { prisma } from "../../config/db.js";
import { razorpay } from "../../config/razorpay.js";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";
import { sendPaymentConfirmationEmail } from "../../utils/Email.Service.js";
export const createOrderService = async ({ userId, monthlyFeeId }) => {

  const fee = await prisma.monthlyFee.findUnique({
    where: { id: monthlyFeeId }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hostelId: true }
  });

  if (!fee) throw new AppError("Fee not found", 404);

  // Validate amount
  if (!fee.amount || fee.amount <= 0) {
    throw new AppError("Invalid fee amount", 400);
  }

  if (fee.status === "PAID") {
    throw new AppError("Already paid", 400);
  }

  if (fee.userId !== userId) {
    throw new AppError("You can only pay your own fees", 403);
  }

  try {
    const order = await razorpay.orders.create({
      amount: fee.amount * 100,
      currency: "INR",
      receipt: `receipt_${fee.id}`
    });

    await prisma.$transaction(async (tx) => {

      const existing = await tx.payment.findUnique({
        where: { monthlyFeeId }
      });

      if (existing) {
        await tx.payment.update({
          where: { id: existing.id },
          data: {
            razorpayOrderId: order.id,
            hostelId: user.hostelId
          }
        });
      } else {
        await tx.payment.create({
          data: {
            userId,
            monthlyFeeId,
            amount: fee.amount,
            mode: "ONLINE",
            razorpayOrderId: order.id,
            hostelId: user.hostelId
          }
        });
      }
    });

    logger.info("Razorpay order created", {
      orderId: order.id,
      userId,
      monthlyFeeId,
      amount: fee.amount
    });

    return order;

  } catch (error) {
    logger.error("Order creation failed", {
      userId,
      monthlyFeeId,
      error: error.message
    });

    throw new AppError("Failed to create order", 500);
  }
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hostelId: true }
  });

  if (!fee) {
    throw new AppError("Fee not found", 404);
  }

  // Validate amount
  if (!fee.amount || fee.amount <= 0) {
    throw new AppError("Invalid fee amount", 400);
  }

  if (fee.status === "PAID") {
    throw new AppError("Already paid", 400);
  }

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
          remarks,
          hostelId: user.hostelId
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
          remarks,
          hostelId: user.hostelId
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

  logger.info("Cash payment recorded", { userId, monthlyFeeId, adminId, amount: fee.amount });
  return true;
};


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

export const getAllPaymentsService = async (page = 1, limit = 20, actorId = null, actorRole = null) => {
  const skip = (page - 1) * limit;

  let where = {};

  // SUPER_ADMIN can only see payments from their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const myHostelLinks = await prisma.userHostel.findMany({
      where: { userId: actorId },
      select: { hostelId: true }
    });
    const myHostelIds = myHostelLinks.map(h => h.hostelId);
    where.hostelId = { in: myHostelIds };
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
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
    prisma.payment.count({ where })
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

export const getRevenueByHostelService = async (hostelId, actorId = null, actorRole = null) => {
  // SUPER_ADMIN can only access revenue from their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actorId, hostelId }
    });
    if (!ownership) {
      throw new AppError("Hostel not found in your workspace", 404);
    }
  }

  const result = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { hostelId, status: "PAID" }
  });

  return { totalRevenue: result._sum.amount || 0 };
};

export const getPlatformRevenueService = async (actorId = null, actorRole = null) => {
  let where = { status: "PAID" };

  // SUPER_ADMIN can only see revenue from their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const myHostelLinks = await prisma.userHostel.findMany({
      where: { userId: actorId },
      select: { hostelId: true }
    });
    const myHostelIds = myHostelLinks.map(h => h.hostelId);
    where.hostelId = { in: myHostelIds };
  }

  const result = await prisma.payment.aggregate({
    _sum: { amount: true },
    where
  });

  return { totalRevenue: result._sum.amount || 0 };
};