// Fix 1: import prisma and logger — were missing, causing 500 on deleteMyAccount
import { asyncHandler } from '../../utils/AsyncHandler.js';
import { successResponse } from '../../utils/ApiResponse.js';
import { prisma } from '../../config/db.js';
import { logger } from '../../utils/logger.js';
import { clearAuthCookies } from '../../utils/tokenHelpers.js';

import {
    getMeService,
    updateMeService,
    getUserFeesService,
    requestProfileUpdateService
} from "./User.Service.js";

// ✅ GET PROFILE
export const getMe = asyncHandler(async (req, res) => {
    const user = await getMeService(req.user.id);

    return successResponse(res, {
        statusCode: 200,
        message: "Profile fetched",
        data: user
    });
});

// ✅ UPDATE PROFILE
export const updateMe = asyncHandler(async (req, res) => {

    const updatedUser = await updateMeService(req.user.id, req.body);

    return successResponse(res, {
        statusCode: 200,
        message: "Profile updated",
        data: updatedUser
    });
});

// ✅ FEES
export const getUserFees = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await getUserFeesService(req.user.id, page, limit);

    return successResponse(res, {
        statusCode: 200,
        message: "Fees fetched",
        data: result
    });
});

// ✅ PROFILE REQUEST
export const requestProfileUpdate = asyncHandler(async (req, res) => {

    const result = await requestProfileUpdateService(req.user.id, req.body);

    return successResponse(res, {
        statusCode: 201,
        message: "Request submitted",
        data: result
    });
});

// ✅ DELETE OWN ACCOUNT
export const deleteMyAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await prisma.$transaction(async (tx) => {
    // Free bed
    await tx.bed.updateMany({ where: { userId }, data: { userId: null } });
    // Remove hostel memberships
    await tx.userHostel.deleteMany({ where: { userId } });
    // Delete user (cascade handles related records)
    await tx.user.delete({ where: { id: userId } });
  });

  // Clear auth cookies
  await clearAuthCookies(res, userId);

  logger.info("User deleted own account", { userId });

  return successResponse(res, {
    statusCode: 200,
    message: "Account deleted successfully",
    data: null
  });
});
