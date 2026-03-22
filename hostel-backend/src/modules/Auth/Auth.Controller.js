// Authentication controller — handles login and logout
import { compare_password } from '../../utils/hash.js'
import { signToken } from '../../utils/jwt.js'
import { asyncHandler } from '../../utils/AsyncHandler.js'
import AppError from '../../utils/AppError.js'
import { successResponse } from '../../utils/ApiResponse.js'
import { prisma } from '../../config/db.js'

// Login with email and password, sets an httpOnly JWT cookie
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Ensure both fields are provided
    if (!email || !password) {
        throw new AppError("All fields are required", 400);
    }

    // Look up the user by email
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError("User not found", 400);
    }

    // Verify the password against the stored hash
    const ismatch = await compare_password(password, user.password);

    if (!ismatch) {
        throw new AppError("Password does not match", 400);
    }

    // Generate a signed JWT containing user id and role
    const token = signToken({
        id: user.id,
        role: user.role
    });

    // Set the token as an httpOnly cookie (7 day expiry)
    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // set to true in production (HTTPS)
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

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

// Logout — clears the JWT cookie
export const logout = asyncHandler(async (req, res) => {
    // Overwrite the token cookie with empty value and expire it
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    return successResponse(res, {
        statusCode: 200,
        message: "Logged out successfully",
        data: null
    });
});
