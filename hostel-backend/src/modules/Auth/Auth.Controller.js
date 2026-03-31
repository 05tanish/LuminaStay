// Authentication controller — handles login and logout
import { compare_password } from '../../utils/hash.js'
import { asyncHandler } from '../../utils/AsyncHandler.js'
import AppError from '../../utils/AppError.js'
import { successResponse } from '../../utils/ApiResponse.js'
import { prisma } from '../../config/db.js'
import { logger } from '../../utils/logger.js'
import { setAuthCookies, clearAuthCookies } from '../../utils/tokenHelpers.js'

// Login with email and password — sets httpOnly access + refresh token cookies
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError("All fields are required", 400);
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    // Use generic message for both "not found" and "wrong password"
    // to prevent user enumeration attacks
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    // If user registered via Google OAuth, they don't have a password
    if (!user.password) {
        throw new AppError("Please login using Google", 400);
    }

    const ismatch = await compare_password(password, user.password);

    if (!ismatch) {
        throw new AppError("Invalid email or password", 401);
    }

    // Issue access + refresh tokens and set cookies
    await setAuthCookies(res, user);

    logger.info("User logged in", { userId: user.id, email: user.email });

    return successResponse(res, {
        statusCode: 200,
        message: "Login successfully",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

// Logout — clears both cookies and invalidates refresh token in Redis
export const logout = asyncHandler(async (req, res) => {
    // req.user may not exist if token is already expired, but we still clear cookies
    const userId = req.user?.id;

    if (userId) {
        await clearAuthCookies(res, userId);
    } else {
        // Clear cookies even without a valid user session
        res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
        res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
    }

    return successResponse(res, {
        statusCode: 200,
        message: "Logged out successfully",
        data: null
    });
});
