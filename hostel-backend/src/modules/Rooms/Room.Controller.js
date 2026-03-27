import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import {AppError }from "../../utils/AppError.js";

import {
  createRoomService,
  getRoomsService,
  assignBedService,
  vacateBedService
} from "../Rooms/Room.Service.js";


// Create Room
export const createRoom = asyncHandler(async (req, res) => {
  const { roomNo, capacity, hostelId } = req.body;

  if (!roomNo || !capacity || !hostelId) {
    throw new AppError("All fields are required", 400);
  }

  const room = await createRoomService(roomNo, capacity, hostelId);

  return successResponse(res, {
    statusCode: 201,
    message: "Room created successfully",
    data: room
  });
});


// Get Rooms
export const getRooms = asyncHandler(async (req, res) => {
  const { hostelId } = req.query;

  if (!hostelId) {
    throw new AppError("hostelId is required", 400);
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