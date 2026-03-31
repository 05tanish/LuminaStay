import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import AppError from "../../utils/AppError.js";

import {
  createHostelService,
  getAllHostelsService,
  getHostelByIdService,
  updateHostelService,
  deleteHostelService
} from "./Hostel.Service.js";


// Create Hostel
export const createHostel = asyncHandler(async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    throw new AppError("Name and address are required", 400);
  }

  const hostel = await createHostelService(name, address);

  return successResponse(res, {
    statusCode: 201,
    message: "Hostel created successfully",
    data: hostel
  });
});


// Get all hostels — [REVIEW] Added pagination
export const getHostels = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await getAllHostelsService(page, limit);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostels fetched successfully",
    data: result
  });
});


// Get single hostel
export const getHostelById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hostel = await getHostelByIdService(id);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostel fetched successfully",
    data: hostel
  });
});


// Update hostel
export const updateHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await updateHostelService(id, req.body);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostel updated successfully",
    data: updated
  });
});


// Delete hostel
export const deleteHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await deleteHostelService(id);

  return successResponse(res, {
    statusCode: 200,
    message: "Hostel deleted successfully",
    data: deleted
  });
});