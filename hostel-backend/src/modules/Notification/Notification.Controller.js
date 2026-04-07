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

  let targetHostelId = null;

  if (req.user.role === 'ADMIN') {
    if (!req.user.hostelId) {
      throw new AppError("Admin is not assigned to a hostel", 400);
    }
    targetHostelId = req.user.hostelId;
  } else if (req.user.role === 'SUPER_ADMIN') {
    targetHostelId = req.body.hostelId || null;
  }

  const notification = await broadcast(title, message, targetHostelId);

  return successResponse(res, {
    statusCode: 200,
    message: targetHostelId ? "Notification sent to hostel users" : "Notification sent to all users",
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await getUserNotificationsService(userId, page, limit);

  return successResponse(res, {
    statusCode: 200,
    message: "Notifications fetched successfully",
    data: result
  });
});


// Mark as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  //  Pass userId to verify ownership
  const notification = await markAsRead(id, userId);

  return successResponse(res, {
    statusCode: 200,
    message: "Notification marked as read",
    data: notification
  });
});


// Get unread notifications 
export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await getUnreadNotificationsService(userId, page, limit);

  return successResponse(res, {
    statusCode: 200,
    message: "Unread notifications fetched",
    data: result
  });
});