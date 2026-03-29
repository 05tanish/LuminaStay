// Admin controller — handles admin-only operations like user creation
import { asyncHandler } from "../../utils/asyncHandler.js";
import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { toaddnewuser, deleteUserService, updateroleservice } from "../admin/Admin.Services.js";


// Create a new user (admin-only)
export const addUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    throw new AppError("All fields are required", 400);
  }
  const user = await toaddnewuser(name, email, phone, password, role, req.user.role);

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
    throw new AppError("User not found", 400);
  }

  const deletedUser = await deleteUserService(userId);

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
  };
  const userupdated = await updateroleservice(userId, role);
  return successResponse(res, {
    statusCode: 200,
    message: "Role updated successfully",
    data: userupdated
  });
});



