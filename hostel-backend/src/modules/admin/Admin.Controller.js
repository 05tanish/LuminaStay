// Admin controller — handles admin-only operations like user creation
import { asyncHandler } from "../../utils/AsyncHandler.js";
import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import {
  toaddnewuser,
  deleteUserService,
  updateroleservice,
  getUsersService,
  createMonthlyFeeService,
  getMonthlyFeesService,
  getProfileRequestsService,
  updateProfileRequestStatusService
} from "./Admin.Services.js";


// get users
export const getUsers = asyncHandler(async (req, res) => {
  let page = Number(req.query.page);
  let limit = Number(req.query.limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;

  limit = Math.min(limit, 100);
  const search = req.query.search || "";

  const result = await getUsersService(page, limit, search);

  return successResponse(res, {
    statusCode: 200,
    message: "Users fetched successfully",
    data: result,
  });
});

// contrioller for creating monthly fees 
export const createMonthlyFee = asyncHandler(async (req, res) => {
  const { userId, month, amount, dueDate } = req.body;

  if (!userId || !month || !amount || !dueDate) {
    throw new AppError("userId, month, amount, and dueDate are required", 400);
  }

  const fee = await createMonthlyFeeService({ userId, month, amount, dueDate });

  return successResponse(res, {
    statusCode: 201,
    message: "Monthly fee created successfully",
    data: fee,
  });
});

//get monthly fees
export const getMonthlyFees = asyncHandler(async (req, res) => {
  let page = Number(req.query.page);
  let limit = Number(req.query.limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;

  limit = Math.min(limit, 100);
  const { userId, status, month } = req.query;

  const result = await getMonthlyFeesService(page, limit, { userId, status, month });

  return successResponse(res, {
    statusCode: 200,
    message: "Monthly fees fetched successfully",
    data: result,
  });
});


// Create a new user (admin-only)
export const addUser = asyncHandler(async (req, res) => {
  //  Validation will be handled by Zod middleware
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    throw new AppError("All fields are required", 400);
  }
  const user = await toaddnewuser(name, email, phone, password, role, req.user.role, req.user.id, req.user.hostelId);

  return successResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    data: user
  });
});


// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("UserId is required", 400);
  }

  const deletedUser = await deleteUserService(req.user, userId,);

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
  const { role } = req.body;
  const { userId } = req.params;

  if (!userId || !role) {
    throw new AppError("Fields cannot be empty", 400);
  }

  if (req.user.id === userId) {
    throw new AppError("You cannot change your own role", 400);
  }

  const userupdated = await updateroleservice(userId, role, req.user);

  return successResponse(res, {
    statusCode: 200,
    message: "Role updated successfully",
    data: userupdated
  });
});

// get profile request  
export const getProfileRequests = asyncHandler(async (req, res) => {

  const requests = await getProfileRequestsService(req.user);

  return successResponse(res, {
    statusCode: 200,
    message: "Pending requests fetched",
    data: requests
  });
});

// update status of request status 
export const updateProfileRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminComment } = req.body;

  const result = await updateProfileRequestStatusService(
    id,
    req.user,
    status,
    adminComment
  );

  return successResponse(res, {
    statusCode: 200,
    message: `Request ${status.toLowerCase()}`,
    data: result
  });
});