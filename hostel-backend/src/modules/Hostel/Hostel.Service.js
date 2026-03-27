import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export const createHostelService = async (name, address) => {
  const existing = await prisma.hostel.findFirst({
    where: {
      address
    }
  });

  if (existing) {
    throw new AppError("Hostel with same address already exists", 400);
  }

    const hostel = await prisma.hostel.create({
    data: {
      name,
      address
    },
    select: {
      id: true,
      name: true,
      address: true
    }
  });
    return hostel;
};


export const getAllHostelsService = async () => {
   const hostelchecks = await prisma.hostel.findMany({
    include: {
      rooms: true,
      users: true
    }
  });
  if (!hostelchecks || hostelchecks.length === 0) {
    throw new AppError("No hostels found", 404);
  }
    const hostels = await prisma.hostel.findMany({
    include: {
      rooms: true,
      users: true
    }
  });
  return hostels;
};


export const getHostelByIdService = async (id) => {
  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: {
      rooms: true,
      users: true
    }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  return hostel;
};


export const updateHostelService = async (id, data) => {
  const hostel = await prisma.hostel.findUnique({
    where: { id }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }
    const updatedHostel = await prisma.hostel.update({
    where: { id },
    data
  });
  return updatedHostel;
};


export const deleteHostelService = async (id) => {
  const hostel = await prisma.hostel.findUnique({
    where: { id }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  return await prisma.hostel.delete({
    where: { id }
  });
};