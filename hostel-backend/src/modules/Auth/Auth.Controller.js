// Authentication controller — handles login and logout
import { compare_password } from '../../utils/hash.js'
import { asyncHandler } from '../../utils/AsyncHandler.js'
import AppError from '../../utils/AppError.js'
import { successResponse } from '../../utils/ApiResponse.js'
import { prisma } from '../../config/db.js'
import { logger } from '../../utils/logger.js'
import { setAuthCookies, clearAuthCookies } from '../../utils/tokenHelpers.js'
import { hash_password } from '../../utils/hash.js'
import { verifyOtpService } from './Otpverification.Service.js'
import { validateInviteService } from '../Invitesystem/Invite.Service.js'
import { redis } from '../../config/redis.js'

// Register with unified logic (Invite vs Standalone)
export const register = asyncHandler(async (req, res) => {
    const { name, email, phone, password, code } = req.body;

    if (!name || !email || !phone || !password) {
        throw new AppError("Name, email, phone, and password are required", 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] }
    });
    if (existingUser) {
        throw new AppError("Email or phone already in use", 400);
    }

    // Verify the email was successfully pre-verified
    const verifiedFlag = await redis.get(`email-verified:${email}`);
    if (!verifiedFlag) {
        throw new AppError("Email has not been verified. Please complete OTP verification first.", 403);
    }

    // If invite code exists, validate it
    let invite = null;
    if (code) {
        invite = await validateInviteService(code);
        if (invite.type === "EMAIL" && invite.email !== email) {
            throw new AppError("This invite is not for your email", 403);
        }
    }

    // Determine the user's role
    const globalRole = code ? (invite.role === "ADMIN" ? "ADMIN" : "USER") : "SUPER_ADMIN";

    // Start Transaction
    const user = await prisma.$transaction(async (tx) => {
        const hashedPassword = await hash_password(password);

        let newUserData = {
            name,
            email,
            phone,
            password: hashedPassword,
            emailVerified: true,
            role: globalRole,
        };

        if (code && invite) {
            newUserData.hostelId = invite.hostelId;
        }

        const newUser = await tx.user.create({
            data: newUserData
        });

        if (code && invite) {
            await tx.userHostel.create({
                data: {
                    userId: newUser.id,
                    hostelId: invite.hostelId,
                    role: invite.role
                }
            });

            await tx.invite.update({
                where: { id: invite.id },
                data: { used: true }
            });
        }

        return newUser;
    });

    // Automatically log user in
    await setAuthCookies(res, user);
    
    // Clear verification flag so it can't be reused
    await redis.del(`email-verified:${email}`);

    logger.info("User registered and logged in", { userId: user.id, email: user.email, role: user.role });

    return successResponse(res, {
        statusCode: 201,
        message: "Registration successful",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            hostelId: user.hostelId
        }
    });
});

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
