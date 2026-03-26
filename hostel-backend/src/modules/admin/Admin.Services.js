import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { hash_password } from "../../utils/hash.js";

// Service to add new user

export const toaddnewuser = async (name, email, phone, password, role, currentUserRole) => {
    
  const existingEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingEmail) {
    throw new AppError("User with this email already exists", 409);
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone }
  });

  if (existingPhone) {
    throw new AppError("User with this phone already exists", 409);
  }

  if (role === "ADMIN" && currentUserRole !== "ADMIN") {
    throw new AppError("You cannot assign ADMIN role", 403);
  }

  const hashedPassword = await hash_password(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true
    }
  });
 return user;
}


export const deleteUserService = async (userId) => {

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const deletedUser = await prisma.user.delete({
    where: { id: userId }
  });

  return deletedUser;
};

export const updateroleservice = async(userId, role) => {
   const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
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