// Authentication middleware — verifies if user session token is valid
import { prisma } from "../config/db.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";

// Protects routes by checking the 'token' cookie
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError('Not authenticated', 401)
  }

  // Verify and decode the JWT token
  // Note: if token is invalid, verifyToken will throw an error caught by asyncHandler
  const decoded = verifyToken(token)

  // Fetch the user from the database to ensure they still exist
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

  // Attach the user object to the request for use in subsequent handlers
  req.user = user
  next()
})