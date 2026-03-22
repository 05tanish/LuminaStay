import { successResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import AppError from "../../utils/AppError.js";

import {
  broadcast,
  sendToUser,
  getUserNotificationsService,
  markAsRead,
  getUnreadNotificationsService
} from "./Notification.Service.js";


// Broadcast notification
export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    throw new AppError("Title and message are required", 400);
  }

  const notification = await broadcast(title, message);

  return successResponse(res, {
    statusCode: 200,
    message: "Notification sent to all users",
    data: notification
  });
});


// Send to specific user
export const sendUserNotification = asyncHandler(async (req, res) => {
  const { title, message, userId } = req.body;

  if (!title || !message || !userId) {
    throw new AppError("Title, message and userId are required", 400);
  }

  const notification = await sendToUser(title, message, userId);

  return successResponse(res, {
    statusCode: 201,
    message: "Notification sent successfully",
    data: notification
  });
});


// Get user notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = await getUserNotificationsService(userId);

  return successResponse(res, {
    statusCode: 200,
    message: "Notifications fetched successfully",
    data: notifications
  });
});


// Mark as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await markAsRead(id);

  return successResponse(res, {
    statusCode: 200,
    message: "Notification marked as read",
    data: notification
  });
});


// Get unread notifications
export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = await getUnreadNotificationsService(userId);

  return successResponse(res, {
    statusCode: 200,
    message: "Unread notifications fetched",
    data: notifications
  });
});