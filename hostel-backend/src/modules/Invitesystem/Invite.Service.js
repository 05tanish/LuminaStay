import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";
import { sendInviteEmail } from "../../utils/Email.Service.js";
// 🔹 Generate random code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};


// ✅ Create Invite
export const createInviteService = async ({
  email,
  role,
  hostelId,
  type,
  expiresInHours = 24,
  actorId = null,
  actorRole = null
}) => {

  // SUPER_ADMIN can only create invites for their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actorId, hostelId }
    });
    if (!ownership) {
      throw new AppError("Hostel not found in your workspace", 404);
    }
  }

  const code = generateCode();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  const existingInvite = await prisma.invite.findFirst({
    where: {
      email,
      hostelId,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (existingInvite) {
    throw new AppError("An active invite already exists for this email and hostel", 400);
  } else if (type === "EMAIL" && !email) {
    throw new AppError("Email is required for EMAIL type invite", 400);
  }
  const invite = await prisma.invite.create({
    data: {
      email,
      role,
      hostelId,
      type,
      code,
      expiresAt
    }
  });

  return invite;
};


// ✅ Validate Invite
export const validateInviteService = async (code) => {

  const invite = await prisma.invite.findUnique({
    where: { code }
  });

  if (!invite) {
    throw new AppError("Invalid invite code", 404);
  }

  if (invite.used) {
    throw new AppError("Invite already used", 400);
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError("Invite expired", 400);
  }

  return invite;
};


// ✅ Use Invite (Register User)
export const useInviteService = async ({
  code,
  name,
  email,
  password,
  hash_password
}) => {

  const invite = await validateInviteService(code);

  // 🔐 Email restriction
  if (invite.type === "EMAIL" && invite.email !== email) {
    throw new AppError("This invite is not for your email", 403);
  }
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  return await prisma.$transaction(async (tx) => {

    // create user
    const hashedPassword = await hash_password(password);

    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // create membership
    await tx.userHostel.create({
      data: {
        userId: user.id,
        hostelId: invite.hostelId,
        role: invite.role
      }
    });

    // mark invite used
    await tx.invite.update({
      where: { id: invite.id },
      data: { used: true }
    });

    return user;
  });
};

// ✅ Get Invites by Hostel
export const getInvitesByHostelService = async (hostelId, actorId = null, actorRole = null) => {
  // SUPER_ADMIN can only access invites from their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actorId, hostelId }
    });
    if (!ownership) {
      throw new AppError("Hostel not found in your workspace", 404);
    }
  }

  const invites = await prisma.invite.findMany({
    where: { hostelId },
    orderBy: { createdAt: "desc" }
  });

  return invites;
};

// ✅ Get All Invites (Global) - scoped to SUPER_ADMIN's own hostels
export const getAllInvitesService = async (actorId = null, actorRole = null) => {
  let where = {};

  // SUPER_ADMIN can only see invites from their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const myHostelLinks = await prisma.userHostel.findMany({
      where: { userId: actorId },
      select: { hostelId: true }
    });
    const myHostelIds = myHostelLinks.map(h => h.hostelId);
    where.hostelId = { in: myHostelIds };
  }

  const invites = await prisma.invite.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      hostel: { select: { name: true } }
    }
  });

  return invites;
};


// ✅ Send Invite Email
export const sendInviteEmailService = async ({ code, email, originUrl }) => {
  const invite = await validateInviteService(code);

  if (invite.type === 'EMAIL' && invite.email !== email) {
    throw new AppError("This invite is bound to a different email address", 400);
  }

  const inviteLink = `${originUrl}/auth/signup?code=${invite.code}`;

  try {
    await sendInviteEmail({
      email,
      inviteLink,
      code: invite.code,
      role: invite.role,
      expiresAt: invite.expiresAt
    });

    logger.info("Invite email sent", { code, email });
    return { success: true };
  } catch (error) {
    logger.error("Invite email send failed", { code, email, error: error.message });
    throw new AppError("Failed to send email", 500);
  }
};