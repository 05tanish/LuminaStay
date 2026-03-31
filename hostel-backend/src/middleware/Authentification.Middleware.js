// Authentication middleware — verifies access token from httpOnly cookie.
// If token is expired, client should call POST /api/auth/refresh to get a new one.
import { prisma } from "../config/db.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

// Protects routes by validating the 'accessToken' cookie
export const protect = asyncHandler(async (req, res, next) => {
  // Read from 'accessToken' cookie (previously was 'token')
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new AppError('Not authenticated', 401)
  }

  // Verify the access token — if expired, throws TokenExpiredError
  // which is handled by the global error middleware
  const decoded = verifyAccessToken(token)

  // Fetch the user from DB to ensure they still exist and get current role
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  if (!user) {
    throw new AppError('User no longer exists', 401)
  }

  req.user = user
  next()
})

// Optional auth — attaches user if token exists, but doesn't block if not.
// Useful for routes that work for both authenticated and anonymous users.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (user) {
      req.user = user;
    }
  } catch {
    // Token invalid/expired — continue as anonymous
  }

  next();
})