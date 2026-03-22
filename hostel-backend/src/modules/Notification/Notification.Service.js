import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

// Broadcast to all users
export const broadcast = async (title, message) => {

  const notification = await prisma.notification.create({
    data: { title, message }
  });

  const users = await prisma.user.findMany({
    select: { id: true }
  });

  await prisma.notificationRecipient.createMany({
    data: users.map((user) => ({
      notificationId: notification.id,
      userId: user.id
    }))
  });

  return notification;
};


// Send to single user
export const sendToUser = async (title, message, userId) => {

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const notification = await prisma.notification.create({
    data: { title, message }
  });

  await prisma.notificationRecipient.create({
    data: {
      notificationId: notification.id,
      userId
    }
  });

  return notification;
};


// Get all notifications for user
export const getUserNotificationsService = async (userId) => {

  return await prisma.notificationRecipient.findMany({
    where: { userId },
    include: { notification: true },
    orderBy: {
      notification: { createdAt: "desc" }
    }
  });
};


// Mark as read
export const markAsRead = async (id) => {

  return await prisma.notificationRecipient.update({
    where: { id },
    data: { read: true }
  });
};


// Get unread notifications
export const getUnreadNotificationsService = async (userId) => {

  return await prisma.notificationRecipient.findMany({
    where: {
      userId,
      read: false
    },
    include: { notification: true }
  });
};