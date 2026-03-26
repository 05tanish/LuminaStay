import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../config/db.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import{ complaintservice,
    deletecomplaintservice,
    getcomplaintsservice,
    updatecomplaintservice,
    updatecomplaintstatusservice,
} from "../Complaint/Complaint.Service.js"

export const createcomplaint = asyncHandler(async(req, res)=>{
    const{ title, description } = req.body;

    if(!title|| !description){
        throw new AppError("all fields are required", 400);
    }
    const complaint = await complaintservice(title,description, req.user.id);

     return successResponse(res,{
        statusCode: 201,
        message: "Complaint created successfully",
        data: complaint,
})
});

export const deletecomplaint = asyncHandler(async(req,res)=>{
    const{complaintID} = req.body;

    if(!complaintID){
        throw new AppError("complaint is required", 400);
    }
    const deletecomplaint = await deletecomplaintservice(complaintID, req.user.id);

     return successResponse(res,{
        statusCode: 200,
        message: "Complaint deleted successfully",
        data: deletecomplaint,
})
});

export const getcomplaint = asyncHandler(async(req,res)=>{
 const complaint = await getcomplaintsservice(req.user.id);
 return successResponse(res,{
    statusCode:200, 
    message:"complaints retruived successfully",
    data:complaint,
 })
})

export const updatecomplaint = asyncHandler(async(req,res)=>{
    const{complaintID,title,description} = req.body;

    if(!complaintID || !title || !description){
        throw new AppError("all fields are required", 400);
    }
    const updatecomplaint = await updatecomplaintservice(complaintID,title,description, req.user.id);

     return successResponse(res,{
        statusCode: 200,
        message: "Complaint updated successfully",
        data: updatecomplaint,
})
}); 

export const updatecomplaintstatus = asyncHandler(async(req,res)=>{
    const{complaintID,status} = req.body;

    if(!complaintID || !status){
        throw new AppError("all fields are required", 400);
    }
    const updatecomplaintstatus = await updatecomplaintstatusservice(complaintID,status);

     return successResponse(res,{
        statusCode: 200,
        message: "Complaint status updated successfully",
        data: updatecomplaintstatus,
})
});