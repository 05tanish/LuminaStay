import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";


// ✅ Create Hostel + Assign SUPER_ADMIN
export const createHostelService = async ({ name, address, userId }) => {

  try {
    const result = await prisma.$transaction(async (tx) => {

      const hostel = await tx.hostel.create({
        data: {
          name,
          address
        }
      });

      await tx.userHostel.create({
        data: {
          userId,
          hostelId: hostel.id,
          role: "ADMIN"
        }
      });

      return hostel;
    });

    // ✅ Log AFTER success
    logger.info("Hostel created", {
      hostelId: result.id,
      name,
      userId
    });

    return result;

  } catch (error) {
    logger.error("Hostel creation failed", {
      name,
      address,
      userId,
      error: error.message
    });

    throw error; // let global handler handle it
  }
};

// ✅ Assign ADMIN to hostel
export const assignAdminService = async ({ userId, hostelId, superAdminId }) => {

  // Verify the hostel belongs to this super admin
  const hostelOwnership = await prisma.userHostel.findFirst({
    where: { userId: superAdminId, hostelId }
  });
  if (!hostelOwnership) {
    throw new AppError("Hostel not found in your workspace", 404);
  }

  const [user, hostel] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.hostel.findUnique({
      where: { id: hostelId, isDeleted: false }
    })
  ]);

  if (!user) throw new AppError("User not found", 404);
  if (!hostel) throw new AppError("Hostel not found", 404);

  const existing = await prisma.userHostel.findUnique({
    where: {
      userId_hostelId: { userId, hostelId }
    }
  });

  if (existing) {
    if (existing.role === "ADMIN") {
      throw new AppError("User is already an admin", 400);
    }

    const updated = await prisma.userHostel.update({
      where: {
        userId_hostelId: { userId, hostelId }
      },
      data: { role: "ADMIN" }
    });

    logger.info("User promoted to admin", { userId, hostelId });

    return updated;
  }

  const result = await prisma.userHostel.create({
    data: {
      userId,
      hostelId,
      role: "ADMIN"
    }
  });

  logger.info("Admin assigned to hostel", { userId, hostelId });

  return result;
};


// ✅ Platform stats — scoped to THIS super admin's own hostels only
export const getPlatformStatsService = async (superAdminId) => {

  // Get hostel IDs this super admin owns (created via UserHostel)
  const myHostelLinks = await prisma.userHostel.findMany({
    where: { userId: superAdminId },
    select: { hostelId: true }
  });
  const myHostelIds = myHostelLinks.map(h => h.hostelId);

  const [
    totalHostels,
    totalUsers,
    openComplaints,
    revenueResult,
    recentComplaints
  ] = await prisma.$transaction([
    // Only count this super admin's active hostels
    prisma.hostel.count({
      where: { id: { in: myHostelIds }, isDeleted: false }
    }),
    // Only count users in this super admin's hostels (exclude SUPER_ADMINs)
    prisma.user.count({
      where: {
        hostelId: { in: myHostelIds },
        role: { not: "SUPER_ADMIN" }
      }
    }),
    // Only complaints from this super admin's hostels
    prisma.complaint.count({
      where: {
        hostelId: { in: myHostelIds },
        status: { in: ["OPEN", "IN_PROGRESS"] }
      }
    }),
    // Only revenue from this super admin's hostels
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { hostelId: { in: myHostelIds }, status: "PAID" }
    }),
    // Recent complaints from this super admin's hostels
    prisma.complaint.findMany({
      take: 5,
      where: { hostelId: { in: myHostelIds } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        hostel: { select: { id: true, name: true } }
      }
    })
  ]);

  return {
    totalHostels,
    totalUsers,
    openComplaints,
    totalRevenue: revenueResult._sum.amount || 0,
    recentComplaints
  };
};


// ✅ Get admins — only admins assigned to THIS super admin's hostels
export const getAllAdminsService = async (superAdminId) => {
  // Get hostel IDs this super admin owns
  const myHostelLinks = await prisma.userHostel.findMany({
    where: { userId: superAdminId },
    select: { hostelId: true }
  });
  const myHostelIds = myHostelLinks.map(h => h.hostelId);

  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      hostelId: { in: myHostelIds }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      hostelId: true,
      hostel: { select: { id: true, name: true, address: true } },
      userHostels: {
        where: { hostelId: { in: myHostelIds } },
        include: {
          hostel: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return admins;
};


export const reassignAdminService = async (userId, newHostelId, superAdminId) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    // Verify the target hostel belongs to this super admin
    const hostelOwnership = await prisma.userHostel.findFirst({
      where: { userId: superAdminId, hostelId: newHostelId }
    });
    if (!hostelOwnership) {
      throw new AppError("Target hostel not found in your workspace", 404);
    }

    const hostel = await prisma.hostel.findUnique({ where: { id: newHostelId } });
    if (!hostel) throw new AppError("Target hostel not found", 404);

    const result = await prisma.$transaction(async (tx) => {
      const membership = await tx.userHostel.findFirst({
        where: { userId, role: "ADMIN" }
      });
      if (!membership) throw new AppError("User is not an admin", 400);

      await tx.userHostel.deleteMany({ where: { userId, role: "ADMIN" } });

      await tx.userHostel.upsert({
        where: { userId_hostelId: { userId, hostelId: newHostelId } },
        update: { role: "ADMIN" },
        create: { userId, hostelId: newHostelId, role: "ADMIN" }
      });

      return await tx.user.update({
        where: { id: userId },
        data: { hostelId: newHostelId },
        select: { id: true, name: true, email: true, hostelId: true }
      });
    });

    logger.info("Admin reassigned", { userId, newHostelId });
    return result;
  } catch (error) {
    logger.error("Admin reassignment failed", { userId, newHostelId, error: error.message });
    throw error;
  }
};

export const removeAdminService = async (userId, superAdminId) => {

  try {
    // Get hostel IDs this super admin owns
    const myHostelLinks = await prisma.userHostel.findMany({
      where: { userId: superAdminId },
      select: { hostelId: true }
    });
    const myHostelIds = myHostelLinks.map(h => h.hostelId);

    // Find admin membership only in super admin's hostels
    const membership = await prisma.userHostel.findFirst({
      where: { 
        userId, 
        role: "ADMIN",
        hostelId: { in: myHostelIds }
      }
    });

    if (!membership) {
      throw new AppError("User is not an admin in your hostels", 400);
    }

    const result = await prisma.$transaction(async (tx) => {

      await tx.userHostel.deleteMany({
        where: { userId, role: "ADMIN" }
      });

      return await tx.user.update({
        where: { id: userId },
        data: {
          role: "USER",
          hostelId: null
        }
      });
    });

    logger.info("Admin removed", { userId });

    return result;

  } catch (error) {
    logger.error("Remove admin failed", {
      userId,
      error: error.message
    });
    throw error;
  }
};
