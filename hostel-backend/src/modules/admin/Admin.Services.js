import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { hash_password } from "../../utils/hash.js";

const ROLE_LEVELS = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  USER: 1
};


export const getUsersService = async (page = 1, limit = 20, search = "") => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        hostelId: true,
        roomId: true,
        createdAt: true,
        hostel: { select: { id: true, name: true } },
        room: { select: { id: true, roomNo: true } },
        bed: { select: { id: true, bedNo: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


export const createMonthlyFeeService = async ({ userId, month, amount, dueDate }) => {
  // Check if fee already exists for this user+month
  const existing = await prisma.monthlyFee.findFirst({
    where: { userId, month },
  });

  if (existing) {
    throw new AppError(`Fee for ${month} already exists for this user`, 409);
  }

  const fee = await prisma.monthlyFee.create({
    data: {
      userId,
      month,
      amount,
      dueDate: new Date(dueDate),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return fee;
};

export const getMonthlyFeesService = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.status) where.status = filters.status;
  if (filters.month) where.month = filters.month;

  const [fees, total] = await Promise.all([
    prisma.monthlyFee.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.monthlyFee.count({ where }),
  ]);

  return {
    fees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserMonthlyFeesService = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [fees, total] = await Promise.all([
    prisma.monthlyFee.findMany({
      where: { userId },
      include: { payment: true },
      orderBy: { dueDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.monthlyFee.count({ where: { userId } }),
  ]);

  return {
    fees,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const toaddnewuser = async (name, email, phone, password, role, actorRole) => {

  const actorRoleLevel = ROLE_LEVELS[actorRole];

  // Default role if none provided
  const assignedRole = role || "USER";
  const targetRoleLevel = ROLE_LEVELS[assignedRole];

  if (targetRoleLevel === undefined) {
    throw new AppError("Invalid role", 400);
  }

  //  RBAC: actor can only assign roles strictly below their own level
  if (actorRoleLevel <= targetRoleLevel) {
    throw new AppError(
      "You are not allowed to assign this role",
      403
    );
  }

  if (!name || !email || !password) {
    throw new AppError("Required fields missing", 400);
  }

  const hashedPassword = await hash_password(password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: assignedRole
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    return user;

  } catch (error) {
    // Handle unique constraint violations with specific messages
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];

      if (field === "email") {
        throw new AppError("Email already exists", 409);
      }

      if (field === "phone") {
        throw new AppError("Phone already exists", 409);
      }
    }

    throw new AppError("Failed to create user", 500);
  }
};

export const deleteUserService = async (actor, userId) => {

  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (actor.id === userId) {
    throw new AppError("You cannot delete yourself", 400);
  }

  const actorRoleLevel = ROLE_LEVELS[actor.role];
  const targetRoleLevel = ROLE_LEVELS[targetUser.role];

  if (actorRoleLevel <= targetRoleLevel) {
    throw new AppError(
      "You are not authorized to delete this user",
      403
    );
  }

  //  Clean up bed assignment before deleting user to avoid FK violations
  await prisma.bed.updateMany({
    where: { userId: userId },
    data: { userId: null }
  });

  const deletedUser = await prisma.user.delete({
    where: { id: userId }
  });

  return deletedUser;
};


export const updateroleservice = async (userId, role, actor) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const actorRoleLevel = ROLE_LEVELS[actor.role];
  const targetRoleLevel = ROLE_LEVELS[role];

  //  Validate that the target role exists in our hierarchy
  if (targetRoleLevel === undefined) {
    throw new AppError("Invalid role", 400);
  }

  if (actorRoleLevel <= targetRoleLevel) {
    throw new AppError("You are not authorized to assign this role", 403);
  }

  //  Also check that actor outranks the user's CURRENT role
  const currentRoleLevel = ROLE_LEVELS[user.role];
  if (actorRoleLevel <= currentRoleLevel) {
    throw new AppError("You are not authorized to modify this user's role", 403);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  return updatedUser;
}