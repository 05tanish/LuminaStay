// User profile controller
import { asyncHandler } from '../../utils/AsyncHandler.js'
import { successResponse } from '../../utils/ApiResponse.js'
import { prisma } from '../../config/db.js'
import AppError from '../../utils/AppError.js'

// Returns the current authenticated user's profile
export const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the 'protect' middleware
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true
            // password field is explicitly excluded for security
        }
    });

    if (!user) {
        throw new AppError("User profile not found", 404);
    }

    return successResponse(res, {
        statusCode: 200,
        message: "Profile successfully fetched",
        data: user
    });
});

// fetch notification for looged in user 
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId: userId },
        { userId: null }
      ]
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return successResponse(res, {
    statusCode: 200,
    message: "Notifications fetched",
    data: notifications
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true }
  });

  return successResponse(res, {
    statusCode: 200,
    message: "Notification marked as read",
    data: notification
  });
});