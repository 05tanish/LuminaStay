import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";
import { logger } from "../../utils/logger.js";
import { sendPasswordResetEmail } from "../../utils/Email.Service.js";
import { hash_password, compare_password } from "../../utils/hash.js";

// Generate secure random token without crypto module
const generateSecureToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Simple hash function without crypto module
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Request password reset
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, password: true }
  });

  // Always return success even if user doesn't exist (security best practice)
  // This prevents email enumeration attacks
  if (!user) {
    logger.warn("Password reset requested for non-existent email", { email });
    return successResponse(res, {
      statusCode: 200,
      message: "If an account exists with this email, a password reset link has been sent"
    });
  }

  // Check if user registered via Google OAuth (no password)
  if (!user.password) {
    logger.warn("Password reset requested for Google OAuth user", { email });
    return successResponse(res, {
      statusCode: 200,
      message: "If an account exists with this email, a password reset link has been sent"
    });
  }

  // Check cooldown (prevent spam)
  const cooldownKey = `password-reset:cooldown:${email}`;
  const cooldown = await redis.get(cooldownKey);
  if (cooldown) {
    throw new AppError("Please wait before requesting another password reset", 429);
  }

  // Generate secure reset token
  const resetToken = generateSecureToken();
  const hashedToken = simpleHash(resetToken);

  // Store hashed token in Redis (1 hour expiry)
  const tokenKey = `password-reset:${hashedToken}`;
  await redis.set(tokenKey, user.id, "EX", 3600);

  // Set cooldown (5 minutes)
  await redis.set(cooldownKey, "1", "EX", 300);

  // Send password reset email
  try {
    await sendPasswordResetEmail({
      email: user.email,
      resetToken,
      name: user.name
    });

    logger.info("Password reset email sent", { userId: user.id, email });

    return successResponse(res, {
      statusCode: 200,
      message: "If an account exists with this email, a password reset link has been sent"
    });
  } catch (error) {
    logger.error("Password reset email failed", { userId: user.id, error: error.message });
    throw new AppError("Failed to send password reset email. Please try again later.", 500);
  }
});

// Reset password with token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }

  // Validate password strength
  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }
  
  // Additional password validation
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    throw new AppError("Password must contain at least one uppercase letter, one lowercase letter, and one number", 400);
  }

  // Hash the token to match what's stored in Redis
  const hashedToken = simpleHash(token);
  const tokenKey = `password-reset:${hashedToken}`;

  // Get userId from Redis
  const userId = await redis.get(tokenKey);

  if (!userId) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, password: true }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check if new password is same as old password
  if (user.password) {
    const isSamePassword = await compare_password(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError("New password must be different from the old password", 400);
    }
  }

  // Hash new password
  const hashedPassword = await hash_password(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  // Delete the reset token from Redis
  await redis.del(tokenKey);

  // Invalidate all refresh tokens for this user (force re-login)
  await redis.del(`refresh:${userId}`);

  logger.info("Password reset successful", { userId, email: user.email });

  return successResponse(res, {
    statusCode: 200,
    message: "Password reset successful. Please login with your new password."
  });
});

// Verify reset token (optional - for frontend to check if token is valid)
export const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new AppError("Token is required", 400);
  }

  const hashedToken = simpleHash(token);
  const tokenKey = `password-reset:${hashedToken}`;

  const userId = await redis.get(tokenKey);

  if (!userId) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  return successResponse(res, {
    statusCode: 200,
    message: "Token is valid",
    data: { valid: true }
  });
});
