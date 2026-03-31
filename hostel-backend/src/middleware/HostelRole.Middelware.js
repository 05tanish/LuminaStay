import { prisma } from "../config/db.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const authorizeHostelRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const hostelId = req.headers["x-hostel-id"] || req.body.hostelId || req.params.hostelId;

    if (!hostelId) {
      throw new AppError("Hostel ID is required", 400);
    }

    const membership = await prisma.userHostel.findUnique({
      where: {
        userId_hostelId: {
          userId,
          hostelId
        }
      }
    });

    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new AppError("Access denied", 403);
    }

    //  Attach membership for downstream handlers to use
    req.membership = membership;

    next();
  });
};