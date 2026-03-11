// Admin controller — handles admin-only operations like user creation
import { prisma } from "../../config/db.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { hash_password } from "../../utils/hash.js";


// Create a new user (admin-only)
export const addUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    throw new AppError("All fields are required", 400);
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingEmail) {
    throw new AppError("User with this email already exists", 409);
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone }
  });

  if (existingPhone) {
    throw new AppError("User with this phone already exists", 409);
  }

  if (role === "ADMIN" && req.user.role !== "ADMIN") {
    throw new AppError("You cannot assign ADMIN role", 403);
  }

  const hashedPassword = await hash_password(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true
    }
  });

  return successResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    data: user
  });
});


// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new AppError("UserId is required", 400);
  }

  const deletedUser = await prisma.user.delete({
    where: { id: userId }
  });

  return successResponse(res, {
    statusCode: 200,
    message: "User deleted successfully",
    data: {
      id: deletedUser.id,
      phone: deletedUser.phone
    }
  });
});


// Update user role
export const updateRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    throw new AppError("Fields cannot be empty", 400);
  }

  if (req.user.id === userId) {
    throw new AppError("You cannot change your own role", 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

  return successResponse(res, {
    statusCode: 200,
    message: "Role updated successfully",
    data: updatedUser
  });
});


// Broadcast notification to all users
export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    throw new AppError("Title and message are required", 400);
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      message
    }
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

  return successResponse(res, {
    statusCode: 200,
    message: "Notification sent to all users",
    data: notification
  });
});


// Send notification to particular user
export const sendUserNotification = asyncHandler(async (req, res) => {
  const { title, message, userId } = req.body;

  if (!title || !message || !userId) {
    throw new AppError("Title, message and userId are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      message
    }
  });

  await prisma.notificationRecipient.create({
    data: {
      notificationId: notification.id,
      userId: userId
    }
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Notification sent successfully",
    data: notification
  });
});