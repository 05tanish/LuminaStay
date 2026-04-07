import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";

// Broadcast to all users in a specific hostel (or all hostels if no hostelId provided)
export const broadcast = async (title, message, hostelId = null) => {
  try {

    const result = await prisma.$transaction(async (tx) => {

      const notification = await tx.notification.create({
        data: { title, message, hostelId }
      });

      const userWhereClause = hostelId ? { hostelId } : {};

      const users = await tx.user.findMany({
        where: userWhereClause,
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
      return {
        notification,
        recipientCount: users.length
      };
    });
    logger.info("Notification broadcast sent", {
      notificationId: result.notification.id,
      hostelId,
      recipientCount: result.recipientCount
    });

    return result.notification;

  } catch (error) {
    logger.error("Notification broadcast failed", {
      hostelId,
      error: error.message
    });

    throw new AppError("Failed to send broadcast", 500);
  }
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

    logger.info("Notification sent to user", { notificationId: notification.id, userId });
    return notification;
  });
};


//  Get all notifications for user (filtered by hostel if user has one)
export const getUserNotificationsService = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // Get user's hostelId to filter notifications
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hostelId: true }
  });

  // Build where clause: get notifications for this user that are either:
  // 1. Global (hostelId is null) OR
  // 2. For their specific hostel (if they have one)
  const notificationWhere = user?.hostelId 
    ? { OR: [{ hostelId: null }, { hostelId: user.hostelId }] }
    : { hostelId: null };

  const [notifications, total] = await Promise.all([
    prisma.notificationRecipient.findMany({
      where: { 
        userId,
        notification: notificationWhere
      },
      include: { 
        notification: {
          include: {
            hostel: { select: { name: true } }
          }
        }
      },
      orderBy: {
        notification: { createdAt: "desc" }
      },
      skip,
      take: limit
    }),
    prisma.notificationRecipient.count({ 
      where: { 
        userId,
        notification: notificationWhere
      }
    })
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


//  Mark as read 
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


//  Get unread notifications (filtered by hostel if user has one)
export const getUnreadNotificationsService = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // Get user's hostelId to filter notifications
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hostelId: true }
  });

  // Build where clause for hostel filtering
  const notificationWhere = user?.hostelId 
    ? { OR: [{ hostelId: null }, { hostelId: user.hostelId }] }
    : { hostelId: null };

  const where = { 
    userId, 
    read: false,
    notification: notificationWhere
  };

  const [notifications, total] = await Promise.all([
    prisma.notificationRecipient.findMany({
      where,
      include: { 
        notification: {
          include: {
            hostel: { select: { name: true } }
          }
        }
      },
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