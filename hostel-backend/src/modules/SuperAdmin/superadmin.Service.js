import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";


// ✅ Create Hostel + Assign SUPER_ADMIN
export const createHostelService = async ({ name, address, userId }) => {

  return await prisma.$transaction(async (tx) => {

    // 1️⃣ create hostel
    const hostel = await tx.hostel.create({
      data: {
        name,
        address
      }
    });

    // 2️⃣ assign creator as SUPER_ADMIN
    await tx.userHostel.create({
      data: {
        userId,
        hostelId: hostel.id,
        role: "ADMIN"
      }
    });

    return hostel;
  });
};


// ✅ Assign ADMIN to hostel
export const assignAdminService = async ({ userId, hostelId }) => {

  // check if already exists
  const existing = await prisma.userHostel.findUnique({
    where: {
      userId_hostelId: {
        userId,
        hostelId
      }
    }
  });

  if (existing) {
    throw new AppError("User already part of this hostel", 400);
  }

  return await prisma.userHostel.create({
    data: {
      userId,
      hostelId,
      role: "ADMIN"
    }
  });
};