import { hash_password, compare_password } from '../../utils/hash.js'
import { signToken } from '../../utils/jwt.js'
import { aysnchandler } from '../../utils/asyncHandler.js'
import AppError from '../../utils/AppError.js'
import { successResponse } from '../../utils/ApiResponse.js'
import prism from '../../config/db.js'
import cookieParser from 'cookie-parser';

export const login = (aysnchandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return (next(new AppError(400, "All fields are required")));
    }

    const user = await prism.user.findUnique({
        where: { email }
    });

    if (!user) {
        return (next(new AppError(400, "User not found")));
    };

    const ismatch = await compare_password(password, user.password);

    if (!ismatch) {
        return (next(new AppError(400, "Password does not match")));
    };

    const token = signToken({
        id: user.id,
        role: user.role
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return successResponse(res, {
        statusCode: 200,
        message: "Login succesfully",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
}));


export const getMe = aysnchandler(async (req, res) => {
    // req.user is set by your auth middleware (decoded JWT)
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    return successResponse(res, {
        statusCode: 200,
        message: "Successfully Fetched",
        data: user
    });
});

export const logout = aysnchandler(async (req, res) => {
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
