import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";
import AppError from "../../utils/AppError.js";

import {
  createInviteService,
  validateInviteService,
  useInviteService
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
    type
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Invite created successfully",
    data: invite
  });
});


// ✅ Validate invite (frontend uses this before showing signup form)
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