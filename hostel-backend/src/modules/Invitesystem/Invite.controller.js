import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import AppError from "../../utils/AppError.js";
import { prisma } from "../../config/db.js";
import { logger } from "../../utils/logger.js";

import {
  createInviteService,
  validateInviteService,
  useInviteService,
  getInvitesByHostelService,
  getAllInvitesService,
  sendInviteEmailService
} from "../Invitesystem/Invite.Service.js";

import { hash_password } from "../../utils/hash.js";


// ✅ Admin creates invite
export const createInvite = asyncHandler(async (req, res) => {
  const { email, role, hostelId, type } = req.body;

  if (!role || !hostelId || !type) {
    throw new AppError("role, hostelId and type are required", 400);
  }

  const invite = await createInviteService({
    email,
    role,
    hostelId,
    type,
    actorId: req.user.id,
    actorRole: req.user.role
  });

  logger.info("Invite created", { email, role, hostelId, type, inviteId: invite.id });

  return successResponse(res, {
    statusCode: 201,
    message: "Invite created successfully",
    data: invite
  });
});


// ✅ Validate invite 
export const validateInvite = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const invite = await validateInviteService(code);

  return successResponse(res, {
    statusCode: 200,
    message: "Invite is valid",
    data: invite
  });
});


// ✅ Register using invite
export const registerWithInvite = asyncHandler(async (req, res) => {
  const { code, name, email, password } = req.body;

  if (!code || !name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const user = await useInviteService({
    code,
    name,
    email,
    password,
    hash_password
  });

  return successResponse(res, {
    statusCode: 201,
    message: "User registered successfully via invite",
    data: user
  });
});

// ✅ Get Invites by Hostel (ADMIN / SUPER_ADMIN)
export const getInvitesByHostel = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;
  const invites = await getInvitesByHostelService(hostelId, req.user.id, req.user.role);

  return successResponse(res, {
    statusCode: 200,
    message: "Invites fetched successfully",
    data: invites
  });
});

// ✅ Get All Invites Globally (SUPER_ADMIN)
export const getAllInvites = asyncHandler(async (req, res) => {
  const invites = await getAllInvitesService(req.user.id, req.user.role);

  return successResponse(res, {
    statusCode: 200,
    message: "All global invites fetched",
    data: invites
  });
});

// ✅ Send Invite Email (ADMIN/SUPER_ADMIN)
export const sendInviteEmail = asyncHandler(async (req, res) => {
  const { code, email, originUrl } = req.body;

  if (!code || !email || !originUrl) {
    throw new AppError("Code, email, and originUrl are required", 400);
  }

  const result = await sendInviteEmailService({ code, email, originUrl });

  return successResponse(res, {
    statusCode: 200,
    message: "Invite email sent successfully",
    data: result
  });
});

// ✅ Delete Invite (ADMIN/SUPER_ADMIN)
export const deleteInvite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invite = await prisma.invite.findUnique({ where: { id } });
  if (!invite) throw new AppError("Invite not found", 404);

  // If ADMIN, check if they have access to this hostel
  if (req.user.role === "ADMIN" && invite.hostelId !== req.user.hostelId) {
    throw new AppError("Unauthorized to delete this invite", 403);
  }

  // If SUPER_ADMIN, check if they own this hostel
  if (req.user.role === "SUPER_ADMIN") {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: req.user.id, hostelId: invite.hostelId }
    });
    if (!ownership) {
      throw new AppError("Invite not found in your workspace", 404);
    }
  }

  await prisma.invite.delete({ where: { id } });

  logger.info("Invite deleted", { inviteId: id, actorId: req.user.id });

  return successResponse(res, {
    statusCode: 200,
    message: "Invite deleted successfully"
  });
});