import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";
import { auditLog } from "../../utils/audit.js";

export const createHostelService = async (name, address, actor) => {
  const existing = await prisma.hostel.findFirst({
    where: { address }
  });

  if (existing) {
    throw new AppError("Hostel with same address already exists", 400);
  }
  if (actor.role !== "SUPER_ADMIN") {
    throw new AppError("Only super admin can create hostel", 403);
  }
  try {
    const hostel = await prisma.hostel.create({
      data: { name, address },
      select: {
        id: true,
        name: true,
        address: true
      }
    });

    logger.info("Hostel created", { hostelId: hostel.id, name, actorId: actor.id });
    return hostel;
  } catch (error) {
    logger.error("Hostel Creation Failed", {
      name,
      actorId: actor.id
    })
    throw new AppError("Failed to create hostel", 500)
  }
};


export const getAllHostelsService = async (page = 1, limit = 10, search = "", actorId = null, actorRole = null) => {
  page = Math.max(1, page);
  const skip = (page - 1) * limit;
  if (limit > 100) limit = 100;
  if (isNaN(limit) || limit <= 0) limit = 10;

  let where = { isDeleted: false };

  // SUPER_ADMIN only sees their own hostels (via UserHostel membership)
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const myLinks = await prisma.userHostel.findMany({
      where: { userId: actorId },
      select: { hostelId: true }
    });
    const myHostelIds = myLinks.map(h => h.hostelId);
    where.id = { in: myHostelIds };
  }

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const [hostels, total] = await Promise.all([
    prisma.hostel.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
        _count: {
          select: { users: true, complaints: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.hostel.count({ where })
  ]);

  return {
    hostels,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

export const getHostelByIdService = async (id, actorId = null, actorRole = null) => {
  // SUPER_ADMIN can only access their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actorId, hostelId: id }
    });
    if (!ownership) {
      throw new AppError("Hostel not found in your workspace", 404);
    }
  }

  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: {
      rooms: {
        include: {
          beds: true
        }
      },
      _count: {
        select: { users: true }
      }
    }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  return hostel;
};


export const updateHostelService = async (id, data, actor) => {
  // SUPER_ADMIN can only update their own hostels
  if (actor.role === "SUPER_ADMIN") {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actor.id, hostelId: id }
    });
    if (!ownership) {
      throw new AppError("Hostel not found in your workspace", 404);
    }
  }

  const hostel = await prisma.hostel.findUnique({
    where: { id }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  try {
    const { name, address } = data;
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;

    const updatedHostel = await prisma.hostel.update({
      where: { id },
      data: updateData
    });
    logger.info("Hostel updated", { hostelId: id, changes: updateData });
    auditLog({
      action: "Hostel_Updated",
      actorId: actor.id,
      targetId: id,
      details: {
        updatedData: data,
      }
    })
    return updatedHostel;

  } catch (error) {
    logger.error("Failed to update hostel", {
      hostelId: id,
      actorId: actor.id,
      data,
      actorrole: actor.role
    })
    throw new AppError("Failed to update hostel", 500);
  }
};

export const deleteHostelService = async (id, mode = "soft", actor) => {
  // SUPER_ADMIN can only delete their own hostels
  if (actor.role === "SUPER_ADMIN") {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actor.id, hostelId: id }
    });
    if (!ownership) {
      throw new AppError("Hostel not found in your workspace", 404);
    }
  }

  const hostel = await prisma.hostel.findUnique({
    where: { id }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  // 🟢 Soft delete
  if (mode === "soft") {
    const result = await prisma.hostel.update({
      where: { id },
      data: { isDeleted: true }
    });

    logger.info("Hostel soft deleted", {
      hostelId: id,
      actorId: actor.id
    });

    return result;
  }

  // 🔴 Hard delete checks
  const linkedUsers = await prisma.userHostel.count({
    where: { hostelId: id }
  });

  if (linkedUsers > 0) {
    throw new AppError(
      "Cannot hard delete hostel with active users. Transfer users first or use soft delete.",
      400
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {

      await tx.invite.deleteMany({ where: { hostelId: id } });

      await tx.complaint.deleteMany({ where: { hostelId: id } });

      await tx.bed.deleteMany({
        where: { room: { hostelId: id } }
      });

      await tx.room.deleteMany({ where: { hostelId: id } });

      await tx.notification.deleteMany({ where: { hostelId: id } });

      return await tx.hostel.delete({
        where: { id }
      });
    });

    logger.info("Hostel hard deleted", {
      hostelId: id,
      actorId: actor.id
    });
    auditLog({
      action: "Hostel_Deleted",
      actorId: actor.id,
      targetId: id,
      details: {
        role: actor.role,
        hostelid: id
      }
    });

    return result;

  } catch (error) {

    logger.error("Hostel deletion failed", {
      hostelId: id,
      actorId: actor.id,
      error: error.message
    });

    throw new AppError("Failed to delete hostel", 500);
  }
};



export const transferHostelService = async (id, targetHostelId, actor) => {

  if (id === targetHostelId) throw new AppError("Target hostel cannot be the same as source", 400);

  // SUPER_ADMIN can only transfer their own hostels
  if (actor.role === "SUPER_ADMIN") {
    const [sourceOwnership, targetOwnership] = await Promise.all([
      prisma.userHostel.findFirst({
        where: { userId: actor.id, hostelId: id }
      }),
      prisma.userHostel.findFirst({
        where: { userId: actor.id, hostelId: targetHostelId }
      })
    ]);
    
    if (!sourceOwnership) {
      throw new AppError("Source hostel not found in your workspace", 404);
    }
    if (!targetOwnership) {
      throw new AppError("Target hostel not found in your workspace", 404);
    }
  }

  const target = await prisma.hostel.findUnique({ where: { id: targetHostelId } });
  if (!target) throw new AppError("Target hostel not found", 404);

  try {
    return await prisma.$transaction(async (tx) => {

      await tx.userHostel.updateMany({
        where: { hostelId: id },
        data: { hostelId: targetHostelId }
      });

      await tx.user.updateMany({
        where: { hostelId: id },
        data: { hostelId: targetHostelId }
      });

      // Transfer Complaints
      await tx.complaint.updateMany({
        where: { hostelId: id },
        data: { hostelId: targetHostelId }
      });


      try {
        await tx.room.updateMany({
          where: { hostelId: id },
          data: { hostelId: targetHostelId }
        });
      } catch (e) {
        throw new AppError("Cannot transfer rooms due to room number conflicts. Resolve conflicts manually first.", 400);
      }


      await tx.hostel.update({
        where: { id },
        data: { isDeleted: true }
      });

      logger.info("Hostel data transfered", { sourceId: id, targetId: targetHostelId });
      auditLog({
        action: "Hostel_Transfered",
        actorId: actor.id,
        targetId: targetHostelId,
      });
      return { success: true };
    });
  } catch (error) {
    logger.error("Hostel transfer failed", {
      sourceId: id,
      targetId: targetHostelId,
      actorId: actor.id,
      error: error.message
    })
    throw new AppError("Failed to transfer hostel data: " + error.message, 500);
  }
};

export const getHostelStatsService = async (hostelId, actorId = null, actorRole = null) => {
  // SUPER_ADMIN can only access stats for their own hostels
  if (actorRole === "SUPER_ADMIN" && actorId) {
    const ownership = await prisma.userHostel.findFirst({
      where: { userId: actorId, hostelId }
    });
    if (!ownership) {
      throw new AppError("Hostel not found in your workspace", 404);
    }
  }

  const [userCount, roomCount, complaintCount, pendingComplaints, revenueResult, pendingFees] = await Promise.all([
    prisma.user.count({ where: { hostelId } }),
    prisma.room.count({ where: { hostelId } }),
    prisma.complaint.count({ where: { hostelId } }),
    prisma.complaint.count({ where: { hostelId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID', user: { hostelId } }
    }),
    prisma.monthlyFee.count({
      where: { status: 'PENDING', user: { hostelId } }
    })
  ]);

  const rooms = await prisma.room.findMany({
    where: { hostelId },
    include: { _count: { select: { beds: true, users: true } } }
  });

  const totalBeds = rooms.reduce((acc, room) => acc + room._count.beds, 0);
  const occupiedBeds = rooms.reduce((acc, room) => acc + room._count.users, 0);

  return {
    userCount,
    roomCount,
    totalBeds,
    occupiedBeds,
    occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
    complaintCount,
    pendingComplaints,
    totalRevenue: revenueResult._sum.amount || 0,
    pendingFees
  };
};