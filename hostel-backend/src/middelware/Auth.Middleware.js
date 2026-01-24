// verification user exists or not 
import {prisma} from "../config/db.js";
import AppError from "../utils/AppError.js";
import { aysnchandler } from '../utils/AsyncHandler.js'
import { verifyToken } from "../utils/jwt.js";

export const protect = aysnchandler(async(req, res)=>{
    
    const token  = req.cookies?.token;

    if(!token){
        throw new AppError('Not authenticated', 401)
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