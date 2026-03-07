// Admin controller — handles admin-only operations like user creation
import { prisma } from '../../config/db.js'
import { asyncHandler } from '../../utils/AsyncHandler.js'
import AppError from '../../utils/AppError.js'
import { successResponse } from '../../utils/ApiResponse.js'
import { ROLES } from '../../constants/Roles.Constants.js'
import { PAYMENT_STATUS } from '../../constants/Paymentstatus.constants.js'
import { hash_password } from '../../utils/hash.js'

// Create a new user (admin-only)
export const adduser = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    // Validate all required fields are present
    if (!name || !email || !phone || !password || !role) {
        throw new AppError("All fields are required", 400);
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    // Hash the password before storing
    const hashedPassword = await hash_password(password);

    // Create the user in the database
    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            password: hashedPassword,
            role
        }
    });

    // Return success without exposing the password hash
    return successResponse(res, {
        statusCode: 201,
        message: "User created successfully",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    });
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new AppError(200, "Phone Not Found");
  }

  const deletedUser = await prisma.user.delete({
    where: {
      phone: phone,
    },
  });

  return successResponse(res, {
    statusCode: 200,
    message: "User Deleted Successfully",
    data: {
      id: deletedUser.id,
      phone: deletedUser.phone,
    },
  });
});

