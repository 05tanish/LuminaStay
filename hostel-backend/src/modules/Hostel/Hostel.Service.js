import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export const createHostelService = async (name, address) => {
  const existing = await prisma.hostel.findFirst({
    where: { address }
  });

  if (existing) {
    throw new AppError("Hostel with same address already exists", 400);
  }

  const hostel = await prisma.hostel.create({
    data: { name, address },
    select: {
      id: true,
      name: true,
      address: true
    }
  });
  return hostel;
};


//  Added pagination and removed the 404 throw for empty results —
// an empty list is a valid response, not an error
export const getAllHostelsService = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [hostels, total] = await Promise.all([
    prisma.hostel.findMany({
      include: {
        rooms: true,
        _count: {
          select: { users: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.hostel.count()
  ]);

  return {
    hostels,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};


export const getHostelByIdService = async (id) => {
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


export const updateHostelService = async (id, data) => {
  const hostel = await prisma.hostel.findUnique({
    where: { id }
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  //  Only allow updating name and address — prevents arbitrary field injection
  const { name, address } = data;
  const updateData = {};
  if (name) updateData.name = name;
  if (address) updateData.address = address;

  const updatedHostel = await prisma.hostel.update({
    where: { id },
    data: updateData
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