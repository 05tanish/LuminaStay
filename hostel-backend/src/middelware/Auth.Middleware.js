import prisma from "../config/db";
import AppError from "../utils/AppError";
import { aysnchandler } from "../utils/asyncHandler";
import { verifyToken } from "../utils/jwt";

export const protect = aysnchandler(async(req, res)=>{
    
    const token  = req.cookies?.token;

    if(!token){
        return (next(new AppError('Not authenticated', 401)))
    }
    const decoded = verifyToken(token)

   
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })
   if (!user) {
    throw new AppError('User no longer exists', 401)
  }
  req.user = user
  next()
})