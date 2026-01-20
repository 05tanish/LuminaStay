// role based acess 
import AppError from "../utils/AppError";

 export const isadmin = async(req , res , next)=>{
  if (req.user.role !== 'ADMIN') 
  {
    throw( next( new AppError(403,"Forbidden Access Not allowed. ")));
  }
  next()
 }