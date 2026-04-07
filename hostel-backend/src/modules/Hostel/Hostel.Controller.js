import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import AppError from "../../utils/AppError.js";

import {
  createHostelService,
  getAllHostelsService,
  getHostelByIdService,
  updateHostelService,
  deleteHostelService,
  transferHostelService,
  getHostelStatsService
} from "./Hostel.Service.js";


// Create Hostel
export const createHostel = asyncHandler(async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    throw new AppError("Name and address are required", 400);
  }

  const hostel = await createHostelService(name, address, req.user);

  return successResponse(res, {
    statusCode: 201,
    message: "Hostel created successfully",
    data: hostel
  });
});


// Get all hostels — scoped to super admin's own hostels
export const getHostels = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllHostelsService(page, limit, search, req.user.id, req.user.role);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostels fetched successfully",
    data: result
  });
});


// Get single hostel
export const getHostelById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hostel = await getHostelByIdService(id, req.user.id, req.user.role);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostel fetched successfully",
    data: hostel
  });
});


// Update hostel
export const updateHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await updateHostelService(id, req.body, req.user);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostel updated successfully",
    data: updated
  });
});


// Delete hostel
export const deleteHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { mode } = req.query;

  const deleted = await deleteHostelService(id, mode, req.user);

  return successResponse(res, {
    statusCode: 200,
    message: `Hostel ${mode === 'hard' ? 'hard deleted' : 'soft deleted'} successfully`,
    data: deleted
  });
});

export const transferHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetHostelId } = req.body;

  if (!targetHostelId) {
    throw new AppError("targetHostelId is required for transfer", 400);
  }

  const result = await transferHostelService(id, targetHostelId, req.user);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostel data transferred successfully",
    data: result
  });
});

export const getHostelStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Hostel ID is required", 400);
  }

  const stats = await getHostelStatsService(id, req.user.id, req.user.role);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostel stats fetched successfully",
    data: stats
  });
});