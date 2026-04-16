import { asyncHandler } from '../../utils/AsyncHandler.js'
import { AppError } from '../../utils/AppError.js'
import { successResponse } from '../../utils/ApiResponse.js'
import { verifyRefreshToken } from '../../utils/jwt.js'
import { redis } from '../../config/redis.js'
import { prisma } from '../../config/db.js'
import { setAuthCookies } from '../../utils/tokenHelpers.js'
import { logger } from '../../utils/logger.js'

export const refreshTokens = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  // Verify the refresh token signature and expiry
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token. Please login again.", 401);
  }

  // Check that this refresh token is still valid in Redis.
  // If the user logged out or the token was rotated, this will fail.
  const storedToken = await redis.get(`refresh:${decoded.id}`);

  if (!storedToken || storedToken !== refreshToken) {
    // Token reuse detected — someone may have stolen the old token.
    // Invalidate ALL sessions for this user as a safety measure.
    await redis.del(`refresh:${decoded.id}`);

    logger.warn("Refresh token reuse detected", { userId: decoded.id });
    throw new AppError("Session invalid. Please login again.", 401);
  }

  // Verify the user still exists and hasn't been deleted
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) {
    await redis.del(`refresh:${decoded.id}`);
    throw new AppError("User no longer exists", 401);
  }

  // Rotate: issue new token pair, old refresh token is overwritten in Redis
  await setAuthCookies(res, user);

  logger.info("Tokens refreshed", { userId: user.id });

  return successResponse(res, {
    statusCode: 200,
    message: "Tokens refreshed successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
