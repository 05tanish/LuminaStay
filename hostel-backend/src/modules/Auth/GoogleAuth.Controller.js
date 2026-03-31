// Google OAuth login controller — verifies Google ID token and issues JWT pair
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../../config/db.js'
import { asyncHandler } from '../../utils/AsyncHandler.js'
import AppError from "../../utils/AppError.js"
import { successResponse } from '../../utils/ApiResponse.js'
import { GOOGLE_CLIENT_ID } from '../../config/env.js'
import { logger } from '../../utils/logger.js'
import { setAuthCookies } from '../../utils/tokenHelpers.js'

const client = new OAuth2Client(GOOGLE_CLIENT_ID)

export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Google token not found", 400);
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID
  })

  const payload = ticket.getPayload();
  const email = payload.email

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new AppError("User not allowed. Contact admin.", 403);
  }

  // Issue access + refresh tokens and set cookies
  await setAuthCookies(res, user);

  logger.info("Google login successful", { userId: user.id, email: user.email });

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