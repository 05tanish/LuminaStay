import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

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
  expiresInHours = 24
}) => {

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