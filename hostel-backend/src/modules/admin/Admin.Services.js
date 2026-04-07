import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { hash_password } from "../../utils/hash.js";
import { auditLog } from "../../utils/audit.js";
import { logger } from "../../utils/logger.js";


const ROLE_LEVELS = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  USER: 1
};

// get all user service — scoped by role:
// ADMIN: only sees USER-role residents in their own hostel
// SUPER_ADMIN: sees all users (excluding other SUPER_ADMINs) in their own hostels only
export const getUsersService = async (page = 1, limit = 20, search = "", actorRole = "ADMIN", actorHostelId = null, actorId = null) => {
  const skip = (page - 1) * limit;

  // Base where clause — scoped by role
  let where = {};

  if (actorRole === "ADMIN") {
    // Admin sees only USER-role residents from their own hostel
    where = {
      role: "USER",
      hostelId: actorHostelId,
    };
  } else if (actorRole === "SUPER_ADMIN") {
    // Super admin sees users only from their own hostels (via UserHostel)
    const myHostelLinks = await prisma.userHostel.findMany({
      where: { userId: actorId },
      select: { hostelId: true }
    });
    const myHostelIds = myHostelLinks.map(h => h.hostelId);

    where = {
      role: { not: "SUPER_ADMIN" },
      hostelId: { in: myHostelIds }
    };
  }

  // Apply search on top of role/hostel filter
  if (search) {
    where = {
      ...where,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    };
  }

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
        userDetails: true,
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

// service for creating monthly fees 
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
// get monthly fees service; 
export const getMonthlyFeesService = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.userId !== undefined) where.userId = filters.userId;
  if (filters.status !== undefined) where.status = filters.status;
  if (filters.month !== undefined) where.month = filters.month;

  const [fees, total] = await Promise.all([
    prisma.monthlyFee.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          }
        }
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

// service for adding new user 
export const toaddnewuser = async (
  name,
  email,
  phone,
  password,
  role,
  actorRole,
  actorId,
  hostelId
) => {

  const actorRoleLevel = ROLE_LEVELS[actorRole];
  if (actorRoleLevel === undefined) {
    throw new AppError("Invalid actor role", 400);
  }
  const assignedRole = role || "USER";
  const targetRoleLevel = ROLE_LEVELS[assignedRole];

  if (targetRoleLevel === undefined) {
    throw new AppError("Invalid role", 400);
  }

  if (actorRoleLevel <= targetRoleLevel) {
    throw new AppError("You are not allowed to assign this role", 403);
  }

  if (!name || !email || !password || !phone) {
    throw new AppError("Required fields missing", 400);
  }

  const hashedPassword = await hash_password(password);

  try {
    const result = await prisma.$transaction(async (tx) => {

      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: assignedRole,
          hostelId
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
    });

    auditLog({
      action: "USER_CREATED",
      actorId,
      targetId: result.id,
      details: {
        role: result.role,
        name: result.name,
        email: result.email,
        phone: result.phone
      }
    });

    return result;

  } catch (error) {
    if (error?.code === "P2002") {
      const target = error.meta?.target;

      if (target?.includes("email")) throw new AppError("Email already exists", 409);
      if (target?.includes("phone")) throw new AppError("Phone already exists", 409);
    }

    throw new AppError("Failed to create user", 500);
  }
};

// delete  user service
export const deleteUserService = async (actor, userId) => {

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true, phone: true, hostelId: true }
  });

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (actor.id === userId) {
    throw new AppError("You cannot delete yourself", 400);
  }

  // SUPER_ADMIN can only delete users from their own hostels
  if (actor.role === "SUPER_ADMIN" && targetUser.hostelId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actor.id, hostelId: targetUser.hostelId }
    });
    if (!ownership) {
      throw new AppError("User not found in your workspace", 404);
    }
  }

  const actorRoleLevel = ROLE_LEVELS[actor.role];
  const targetRoleLevel = ROLE_LEVELS[targetUser.role];

  if (actorRoleLevel === undefined) {
    throw new AppError("Actor role invalid", 400);
  }

  if (targetRoleLevel === undefined) {
    throw new AppError("Target role invalid", 400);
  }

  if (actorRoleLevel <= targetRoleLevel) {
    throw new AppError("Not authorized to delete this user", 403);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {

      await tx.bed.updateMany({
        where: { userId },
        data: { userId: null }
      });

      const deletedUser = await tx.user.delete({
        where: { id: userId }
      });

      return deletedUser;
    });

    auditLog({
      action: "USER_DELETED",
      actorId: actor.id,
      targetId: result.id,
      details: {
        role: result.role,
        name: result.name,
        email: result.email,
        phone: result.phone
      }
    });

    return result;

  } catch (error) {
    logger.error("Failed to delete user", { userId, error: error.message });

    throw new AppError(
      error.message || "Failed to delete user",
      error.statusCode || 500
    );
  }
};

// update role service
export const updateRoleService = async (userId, role, actor) => {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (actor.id === userId) {
    throw new AppError("You cannot change your own role", 400);
  }

  const actorRoleLevel = ROLE_LEVELS[actor.role];
  const targetRoleLevel = ROLE_LEVELS[role];
  const currentRoleLevel = ROLE_LEVELS[user.role];

  if (actorRoleLevel === undefined) {
    throw new AppError("Invalid actor role", 400);
  }

  if (targetRoleLevel === undefined) {
    throw new AppError("Invalid role", 400);
  }

  if (actorRoleLevel <= targetRoleLevel) {
    throw new AppError("You are not authorized to assign this role", 403);
  }

  if (actorRoleLevel <= currentRoleLevel) {
    throw new AppError("You are not authorized to modify this user's role", 403);
  }

  if (user.role === role) {
    return user;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {

      const updatedUser = await tx.user.update({
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
    });

    // ✅ audit AFTER success
    auditLog({
      action: "ROLE_UPDATED",
      actorId: actor.id,
      targetId: userId,
      details: {
        oldRole: user.role,
        newRole: role
      }
    });

    return result;

  } catch (error) {
    throw new AppError(
      error.message || "Failed to update role",
      error.statusCode || 500
    );
  }
};
// get profile request service 
export const getProfileRequestsService = async (user) => {

  const requests = await prisma.profileUpdateRequest.findMany({
    where: {
      status: "PENDING",
      user: {
        hostelId: user.hostelId
      }
    },
    include: {
      user: {
        select: { name: true, email: true, phone: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return requests;
};
// update profile request stats service 
export const updateProfileRequestStatusService = async (
  id,
  user,
  status,
  adminComment
) => {

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new AppError("Not authorized", 403);
  }

  const result = await prisma.$transaction(async (tx) => {

    const request = await tx.profileUpdateRequest.findUnique({
      where: { id }
    });

    if (!request) {
      throw new AppError("Request not found", 404);
    }


    if (request.status !== "PENDING") {
      throw new AppError("Request already processed", 400);
    }

    const updatedRequest = await tx.profileUpdateRequest.update({
      where: { id },
      data: { status, adminComment }
    });

    if (status === "APPROVED") {
      const changes = request.requestedChanges || {};

      await tx.user.update({
        where: { id: request.userId },
        data: {
          userDetails: {
            upsert: {
              create: {
                fatherName: changes.fatherName,
                fatherPhone: changes.fatherPhone,
                fatherProfession: changes.fatherProfession,
                motherName: changes.motherName,
                motherPhone: changes.motherPhone,
                motherProfession: changes.motherProfession,
                parentAddress: changes.parentAddress,
                permanentPhone: changes.permanentPhone
              },
              update: {
                ...changes
              }
            }
          }
        }
      });
    }

    return updatedRequest;
  });


  auditLog({
    action: "PROFILE_REQUEST_UPDATED",
    actorId: user.id,
    targetId: id,
    details: {
      status,
      adminComment
    }
  });

  return result;
};

// Get single user with full details (for super admin user detail view)
export const getSingleUserService = async (userId, actor) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      hostelId: true,
      roomId: true,
      createdAt: true,
      emailVerified: true,
      hostel: { select: { id: true, name: true, address: true } },
      room: { select: { id: true, roomNo: true } },
      bed: { select: { id: true, bedNo: true } },
      userDetails: true,
      complaints: {
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      monthlyFees: {
        select: { id: true, month: true, amount: true, status: true, dueDate: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) throw new AppError("User not found", 404);

  // SUPER_ADMIN can only see users from their own hostels
  if (actor.role === "SUPER_ADMIN" && user.hostelId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actor.id, hostelId: user.hostelId }
    });
    if (!ownership) {
      throw new AppError("User not found in your workspace", 404);
    }
  }

  // SUPER_ADMIN users cannot see other SUPER_ADMIN users
  if (user.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    throw new AppError("Access denied", 403);
  }

  return user;
};

// Hard delete — removes user and all related data completely
export const hardDeleteUserService = async (actor, userId) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true, hostelId: true },
  });

  if (!targetUser) throw new AppError("User not found", 404);
  if (actor.id === userId) throw new AppError("You cannot delete yourself", 400);

  // SUPER_ADMIN can only delete users from their own hostels
  if (actor.role === "SUPER_ADMIN" && targetUser.hostelId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actor.id, hostelId: targetUser.hostelId }
    });
    if (!ownership) {
      throw new AppError("User not found in your workspace", 404);
    }
  }

  // Only SUPER_ADMIN can hard-delete anyone; ADMIN can only hard-delete USER role
  if (actor.role === "ADMIN" && targetUser.role !== "USER") {
    throw new AppError("Admins can only delete residents", 403);
  }
  if (actor.role === "ADMIN" && targetUser.role === "SUPER_ADMIN") {
    throw new AppError("Cannot delete a Super Admin", 403);
  }

  await prisma.$transaction(async (tx) => {
    // Free bed
    await tx.bed.updateMany({ where: { userId }, data: { userId: null } });
    // Remove hostel memberships
    await tx.userHostel.deleteMany({ where: { userId } });
    // Delete the user (cascade handles related records per schema)
    await tx.user.delete({ where: { id: userId } });
  });

  logger.info("User hard deleted", { actorId: actor.id, targetId: userId });
  return { id: userId, name: targetUser.name };
};
