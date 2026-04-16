import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";


// Create Room + Auto Create Beds
export const createRoomService = async ({
  roomNo,
  capacity,
  hostelId,
  userId
}) => {
  if (!roomNo || capacity < 1 || capacity > 20) {
    throw new AppError("Invalid room data: capacity must be between 1 and 20", 400);
  }

  const hostel = await prisma.hostel.findFirst({
    where: {
      id: hostelId,
      isDeleted: false
    }
  });

  if (!hostel) {
    throw new AppError("Hostel not found or access denied", 404);
  }

  const existingRoom = await prisma.room.findFirst({
    where: { roomNo, hostelId }
  });

  if (existingRoom) {
    throw new AppError("Room already exists in this hostel", 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          roomNo,
          capacity,
          hostelId
        }
      });

      const beds = Array.from({ length: capacity }).map((_, i) => ({
        bedNo: `B${i + 1}`,
        roomId: room.id
      }));

      await tx.bed.createMany({ data: beds });

      return await tx.room.findUnique({
        where: { id: room.id },
        include: { beds: true }
      });
    });

    logger.info("Room created", {
      roomId: result.id,
      roomNo,
      hostelId,
      capacity
    });

    return result;

  } catch (error) {
    logger.error("Room creation failed", {
      roomNo,
      hostelId,
      error: error.message
    });

    throw new AppError("Failed to create room", 500);
  }
};

// Get all rooms with occupancy
export const getRoomsService = async (hostelId) => {
  const hostel = await prisma.hostel.findUnique({
    where: { id: hostelId }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }
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
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }
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

    logger.info("Bed assigned", { userId, bedId, roomId: bed.roomId });
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

    logger.info("Bed vacated", { bedId, previousUserId: bed.userId });
    return { success: true };
  });
};