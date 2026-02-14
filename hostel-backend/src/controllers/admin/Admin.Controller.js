import {prisma} from 'prisma'
import {aysnchandler} from '../../utils/AsyncHandler'
import AppError from '../../utils/AppError'
import {successResponse } from '../../utils/ApiResponse'
import { ROLES } from '../../constants/Roles.Constants'
import {PAYMENTSTATUS} from '../../constants/Paymentstatus.constants'


export const adduser = aysnchandler(async(req, res)=>{
    const {name, email, phone, password, role   }= req.body
})
