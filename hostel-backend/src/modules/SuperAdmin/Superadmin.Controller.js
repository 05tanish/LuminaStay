import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import AppError from "../../utils/AppError.js";

import {
  createHostelService,
  assignAdminService
} from "../SuperAdmin/superadmin.Service.js";


// ✅ SUPER ADMIN → Create Hostel
export const createHostel = asyncHandler(async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    throw new AppError("Name and address are required", 400);
  }

  const hostel = await createHostelService({
    name,
    address,
    userId: req.user.id
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Hostel created successfully",
    data: hostel
  });
});


// ✅ SUPER ADMIN → Assign ADMIN
export const assignAdmin = asyncHandler(async (req, res) => {
  const { userId, hostelId } = req.body;

  if (!userId || !hostelId) {
    throw new AppError("userId and hostelId are required", 400);
  }

  const admin = await assignAdminService({ userId, hostelId });

  return successResponse(res, {
    statusCode: 200,
    message: "Admin assigned successfully",
    data: admin
  });
});