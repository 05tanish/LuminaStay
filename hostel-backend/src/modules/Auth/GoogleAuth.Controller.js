// Google OAuth login controller — verifies Google ID token and issues JWT pair
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../../config/db.js'
import { asyncHandler } from '../../utils/AsyncHandler.js'
import AppError from "../../utils/AppError.js"
import { successResponse } from '../../utils/ApiResponse.js'
import { GOOGLE_CLIENT_ID } from '../../config/env.js'
import { logger } from '../../utils/logger.js'
import { setAuthCookies } from '../../utils/tokenHelpers.js'
import { validateInviteService } from '../Invitesystem/Invite.Service.js'

const client = new OAuth2Client(GOOGLE_CLIENT_ID)

// ─── Shared: verify Google token and return payload ──────────────────────────
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch {
    throw new AppError("Invalid Google token. Please try again.", 401);
  }
};

// ─── Login with Google (existing users only) ─────────────────────────────────
export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new AppError("Google token not found", 400);

  const payload = await verifyGoogleToken(token);
  const email = payload.email;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Tell the frontend to show the Google registration form
    return res.status(404).json({
      success: false,
      status: 'fail',
      message: "No account found. Please register with your invite code.",
      code: "GOOGLE_USER_NOT_FOUND",
      email,
      name: payload.name || email.split('@')[0],
    });
  }

  await setAuthCookies(res, user);
  logger.info("Google login successful", { userId: user.id, email });

  return successResponse(res, {
    statusCode: 200,
    message: "Google login successful",
    data: { id: user.id, name: user.name, email: user.email, role: user.role, hostelId: user.hostelId }
  });
});

// ─── Register with Google (new users) ────────────────────────────────────────
// Google has already verified the email — no OTP needed.
// Invite code is OPTIONAL:
//   - With code  → role and hostel come from the invite
//   - Without code, no SUPER_ADMIN exists → becomes SUPER_ADMIN (first user)
//   - Without code, SUPER_ADMIN exists → registers as unassigned USER
export const googleRegister = asyncHandler(async (req, res) => {
  const { token, code, name, phone } = req.body;

  if (!token) throw new AppError("Google token is required", 400);
  if (!name || name.trim().length < 2) throw new AppError("Name must be at least 2 characters", 400);
  if (!phone || phone.trim().length < 10) throw new AppError("Valid phone number is required", 400);

  // Verify Google token — email is trusted from Google
  const payload = await verifyGoogleToken(token);
  const email = payload.email;

  // Check if account already exists
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] }
  });
  if (existing) {
    throw new AppError("An account with this email or phone already exists. Please log in.", 400);
  }

  // Determine role and hostel from invite code (if provided)
  let invite = null;
  let globalRole = "USER";
  let hostelId = null;

  if (code && code.trim()) {
    // Validate the invite code
    invite = await validateInviteService(code.trim());

    // If invite is EMAIL-restricted, it must match the Google email
    if (invite.type === "EMAIL" && invite.email !== email) {
      throw new AppError("This invite was sent to a different email address.", 403);
    }

    globalRole = invite.role === "ADMIN" ? "ADMIN" : "USER";
    hostelId = invite.hostelId;
  } else {
    // No invite code → always becomes a new SUPER_ADMIN, completely isolated.
    // Each SUPER_ADMIN has their own independent workspace with no shared data.
    globalRole = "SUPER_ADMIN";
  }

  // Create user in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: name.trim(),
        email,
        phone: phone.trim(),
        emailVerified: true, // Google already verified the email
        role: globalRole,
        hostelId,
      }
    });

    if (invite) {
      await tx.userHostel.create({
        data: { userId: newUser.id, hostelId: invite.hostelId, role: invite.role }
      });
      await tx.invite.update({ where: { id: invite.id }, data: { used: true } });
    }

    return newUser;
  });

  await setAuthCookies(res, user);
  logger.info("Google registration successful", { userId: user.id, email, role: user.role });

  return successResponse(res, {
    statusCode: 201,
    message: "Account created successfully",
    data: { id: user.id, name: user.name, email: user.email, role: user.role, hostelId: user.hostelId }
  });
});