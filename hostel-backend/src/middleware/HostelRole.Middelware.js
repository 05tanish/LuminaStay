// middleware/hostelRole.middleware.js

import { prisma } from "../config/db.js";
import AppError from "../utils/AppError.js";

export const authorizeHostelRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const hostelId = req.headers["x-hostel-id"];

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

    req.membership = membership; // useful later

    next();
  };
};