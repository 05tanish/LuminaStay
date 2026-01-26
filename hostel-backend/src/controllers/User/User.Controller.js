import { aysnchandler } from '../utils/asyncHandler.js'
import { successResponse } from '../../utils/ApiResponse.js'
import {prisma} from '../../config/db.js'
import AppError from '../../utils/AppError.js' 



export const getMe = aysnchandler(async (req, res) => {
    // req.user is set by your auth middleware (decoded JWT)
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    return successResponse(res, {
        statusCode: 200,
        message: "Successfully Fetched",
        data: user
    });
});