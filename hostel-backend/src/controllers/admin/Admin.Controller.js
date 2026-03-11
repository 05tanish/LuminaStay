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

// admin can update role as by default all are created as user 
export const update_role = asyncHandler(async(req, res)=>{
 const {userid,role}  = req.body;
 
 if(!userid||!role){
  throw new AppError(400, "Filelds cannot be empty ");
 }
  const updaterole = await prisma.user.update({
    where:{
      id:userid,
    },
    data:{
      role:role,
    },
  });
if (req.user.id === userid) {
  throw new AppError(400,"You cannot change your own role");
}
  return successResponse(res, {
  statusCode:200,
  message:"Role is been sucessfulay updated",
  data:updaterole,
  });
});


//admin can broadcast notification to all users 
export const broadcastnotification = asyncHandler(async(req,res)=>{
  const {title,message}= req.body;

  const notification = await prisma.notification.create({
    data:{
      title,
      message,
      userid : null,
    },
  });
  return successResponse(res,({
    statusCode:2001,
    message:"Notification is succesfully send to all users",
    data:notification
  }));
});

// admin can. send notifation tio particular user 
 export const sendusernotification  = asyncHandler(async(req,res)=>{
  const{title, message, userid}= req.body;

  const notification = await prisma.notification.create({
    data:{
      title, 
      message, 
      userid
        },
  });

  return successResponse(res, ({
    statusCode:201, 
    message:"Notification send to user",
    data:notification
  }));
});

