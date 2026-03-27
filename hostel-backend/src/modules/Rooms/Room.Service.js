import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";


// Create Room + Auto Create Beds
export const createRoomService = async (roomNo, capacity, hostelId) => {

  return await prisma.$transaction(async (tx) => {

    // 1️⃣ create room
    const room = await tx.room.create({
      data: {
        roomNo,
        capacity,
        hostelId
      }
    });

    // 2️⃣ create beds automatically
    const beds = Array.from({ length: capacity }).map((_, i) => ({
      bedNo: `B${i + 1}`,
      roomId: room.id
    }));

    await tx.bed.createMany({ data: beds });

    return room;
  });
};


// Get all rooms with occupancy
export const getRoomsService = async (hostelId) => {

  const rooms = await prisma.room.findMany({
    where: { hostelId },
    include: {
      beds: {
        include: {
          user: true
        }
      }
    }
  });

  // add occupancy info
  return rooms.map(room => {
    const occupied = room.beds.filter(b => b.userId !== null).length;

    return {
      ...room,
      occupiedBeds: occupied,
      vacantBeds: room.capacity - occupied
    };
  });
};


// Assign bed to user
export const assignBedService = async (userId, bedId) => {

  const bed = await prisma.bed.findUnique({
    where: { id: bedId }
  });

  if (!bed) {
    throw new AppError("Bed not found", 404);
  }

  if (bed.userId) {
    throw new AppError("Bed already occupied", 400);
  }

  return await prisma.$transaction(async (tx) => {

    // assign bed
    await tx.bed.update({
      where: { id: bedId },
      data: { userId }
    });

    // update user room
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        roomId: bed.roomId
      }
    });

    return updatedUser;
  });
};


// Vacate bed
export const vacateBedService = async (bedId) => {

  const bed = await prisma.bed.findUnique({
    where: { id: bedId }
  });

  if (!bed || !bed.userId) {
    throw new AppError("Bed is already vacant", 400);
  }

  return await prisma.$transaction(async (tx) => {

    await tx.user.update({
      where: { id: bed.userId },
      data: {
        roomId: null
      }
    });

    await tx.bed.update({
      where: { id: bedId },
      data: { userId: null }
    });

    return { success: true };
  });
};