import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { AppError } from "../../utils/AppError.js";

import {
  createHostelService,
  assignAdminService,
  getPlatformStatsService,
  getAllAdminsService,
  reassignAdminService,
  removeAdminService
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

  const admin = await assignAdminService({ 
    userId, 
    hostelId, 
    superAdminId: req.user.id 
  });

  return successResponse(res, {
    statusCode: 200,
    message: "Admin assigned successfully",
    data: admin
  });
});


// ✅ SUPER ADMIN → Platform-wide stats (scoped to own hostels)
export const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await getPlatformStatsService(req.user.id);

  return successResponse(res, {
    statusCode: 200,
    message: "Platform stats fetched successfully",
    data: stats
  });
});


// ✅ SUPER ADMIN → List admins (scoped to own hostels)
export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await getAllAdminsService(req.user.id);

  return successResponse(res, {
    statusCode: 200,
    message: "Admins fetched successfully",
    data: admins
  });
});


// ✅ SUPER ADMIN → Reassign admin to different hostel (scoped to own hostels)
export const reassignAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hostelId } = req.body;

  if (!hostelId) {
    throw new AppError("hostelId is required", 400);
  }

  const updated = await reassignAdminService(id, hostelId, req.user.id);

  return successResponse(res, {
    statusCode: 200,
    message: "Admin reassigned successfully",
    data: updated
  });
});


// ✅ SUPER ADMIN → Remove admin (demote to USER)
export const removeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await removeAdminService(id, req.user.id);

  return successResponse(res, {
    statusCode: 200,
    message: "Admin removed successfully",
    data: result
  });
});
