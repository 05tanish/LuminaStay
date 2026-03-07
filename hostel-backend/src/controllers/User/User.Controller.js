// User profile controller
import { asyncHandler } from '../../utils/AsyncHandler.js'
import { successResponse } from '../../utils/ApiResponse.js'
import { prisma } from '../../config/db.js'
import AppError from '../../utils/AppError.js'

// Returns the current authenticated user's profile
export const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the 'protect' middleware
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true
            // password field is explicitly excluded for security
        }
    });

    if (!user) {
        throw new AppError("User profile not found", 404);
    }

    return successResponse(res, {
        statusCode: 200,
        message: "Profile successfully fetched",
        data: user
    });
});
