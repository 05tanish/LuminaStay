import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

// Broadcast to all users
export const broadcast = async (title, message) => {

  //  Use a transaction to ensure notification and recipients are created atomically
  return await prisma.$transaction(async (tx) => {
    const notification = await tx.notification.create({
      data: { title, message }
    });

    const users = await tx.user.findMany({
      select: { id: true }
    });

    if (users.length > 0) {
      await tx.notificationRecipient.createMany({
        data: users.map((user) => ({
          notificationId: notification.id,
          userId: user.id
        }))
      });
    }

    return notification;
  });
};


// Send to single user
export const sendToUser = async (title, message, userId) => {

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return await prisma.$transaction(async (tx) => {
    const notification = await tx.notification.create({
      data: { title, message }
    });

    await tx.notificationRecipient.create({
      data: {
        notificationId: notification.id,
        userId
      }
    });

    return notification;
  });
};


//  Get all notifications for user — added pagination
export const getUserNotificationsService = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notificationRecipient.findMany({
      where: { userId },
      include: { notification: true },
      orderBy: {
        notification: { createdAt: "desc" }
      },
      skip,
      take: limit
    }),
    prisma.notificationRecipient.count({ where: { userId } })
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};


//  Mark as read — added userId check for ownership verification
export const markAsRead = async (id, userId) => {
  const recipient = await prisma.notificationRecipient.findUnique({
    where: { id }
  });

  if (!recipient) {
    throw new AppError("Notification not found", 404);
  }

  //  Verify the notification belongs to this user
  if (recipient.userId !== userId) {
    throw new AppError("Not authorized to update this notification", 403);
  }

  return await prisma.notificationRecipient.update({
    where: { id },
    data: { read: true }
  });
};


//  Get unread notifications — added pagination
export const getUnreadNotificationsService = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const where = { userId, read: false };

  const [notifications, total] = await Promise.all([
    prisma.notificationRecipient.findMany({
      where,
      include: { notification: true },
      orderBy: {
        notification: { createdAt: "desc" }
      },
      skip,
      take: limit
    }),
    prisma.notificationRecipient.count({ where })
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};