// Google OAuth login controller — verifies Google ID token and issues JWT
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../../config/db.js'
import { asyncHandler } from '../../utils/AsyncHandler.js'
import AppError from "../../utils/AppError.js"
import { signToken } from '../../utils/jwt.js'
import { successResponse } from '../../utils/ApiResponse.js'

// Initialize Google OAuth2 client with the client ID from env
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Verify Google token, look up existing user, and issue a JWT cookie
export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Google token not found", 400);
  }

  // Verify the Google ID token and extract the payload
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })

  const payload = ticket.getPayload();
  const email = payload.email

  // Check if this Google user exists in our database
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new AppError("User not allowed. Contact admin.", 403);
  }

  // Generate a JWT for the authenticated user
  const jwtToken = signToken({
    id: user.id,
    role: user.role
  })

  // Set the JWT (not the Google token) as an httpOnly cookie
  res.cookie('token', jwtToken, {
    httpOnly: true,
    secure: false, // set to true in production (HTTPS)
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  return successResponse(res, {
    statusCode: 200,
    message: "Google login successful",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
});