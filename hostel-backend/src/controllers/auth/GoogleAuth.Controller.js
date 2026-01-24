import { OAuth2Client } from 'google-auth-library'
import {prisma} from '../../config/db.js'
import {aysnchandler} from '../../utils/AsyncHandler.js'
import AppError from "../../utils/AppError.js"
import { signToken } from '../../utils/jwt.js'
import {successResponse}   from '../../utils/ApiResponse.js'



const client = new OAuth2Client(process.env.gooGOOGLE_CLIENT_ID)    
 
export const  googleLogin = aysnchandler(async(req , res)=>{
    const{token} = req.body;

    if(!token){
        throw new AppError(400,"Googel token not found ");
    }
   
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })

  const payload = ticket.getPayload();
  const email = payload.email

  const user = await prisma.user.findUnique({
    where:{email}
  })
  if(!user){
     throw new AppError(403,"User not allowed. Contact admin.");
  }

  const jwtToken = signToken({
    id: user.id,
    role: user.role
  })
res.cookie('token',token,{
     httpOnly: true,
    sameSite: 'strict'
})
 return successResponse(res,{
    statusCode:200,
    message:"Google login successful",
    data:{
         id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
 })
});