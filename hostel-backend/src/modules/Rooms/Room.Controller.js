import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import AppError from "../../utils/AppError.js";

import {
  createRoomService,
  getRoomsService,
  assignBedService,
  vacateBedService
} from "../Rooms/Room.Service.js";


export const createRoom = asyncHandler(async (req, res) => {
  const { roomNo, capacity } = req.body;
  const user = req.user;

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new AppError("Unauthorized", 403);
  }

  if (!user.hostelId) {
    throw new AppError("Your account is not linked to any hostel. Please contact Super Admin.", 400);
  }

  const room = await createRoomService({
    roomNo,
    capacity,
    hostelId: user.hostelId,
    userId: user.id
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Room created successfully",
    data: room
  });
});


// Get Rooms — uses hostelId from query OR from authenticated user's session
export const getRooms = asyncHandler(async (req, res) => {
  // Prefer explicit query param, fall back to the logged-in user's hostelId
  const hostelId = req.query.hostelId || req.user.hostelId;

  if (!hostelId) {
    throw new AppError("hostelId is required. Your account is not linked to a hostel.", 400);
  }

  const rooms = await getRoomsService(hostelId);

  return successResponse(res, {
    statusCode: 200,
    message: "Rooms fetched successfully",
    data: rooms
  });
});


// Assign Bed
export const assignBed = asyncHandler(async (req, res) => {
  const { userId, bedId } = req.body;

  if (!userId || !bedId) {
    throw new AppError("userId and bedId are required", 400);
  }

  const result = await assignBedService(userId, bedId);

  return successResponse(res, {
    statusCode: 200,
    message: "Bed assigned successfully",
    data: result
  });
});


// Vacate Bed
export const vacateBed = asyncHandler(async (req, res) => {
  const { bedId } = req.body;

  if (!bedId) {
    throw new AppError("bedId is required", 400);
  }

  const result = await vacateBedService(bedId);

  return successResponse(res, {
    statusCode: 200,
    message: "Bed vacated successfully",
    data: result
  });
});
