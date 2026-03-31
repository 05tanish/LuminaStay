import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
    complaintservice,
    deletecomplaintservice,
    getcomplaintservice,
    updatecomplaintservice,
    updatecomplaintstatusservice,
} from "./Complaint.Service.js"

export const createcomplaint = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new AppError("All fields are required", 400);
    }
    const complaint = await complaintservice(title, description, req.user.id);

    return successResponse(res, {
        statusCode: 201,
        message: "Complaint created successfully",
        data: complaint,
    })
});

export const deletecomplaint = asyncHandler(async (req, res) => {
    //  Changed from req.body to req.params — DELETE requests should
    // identify the resource via URL parameter, not request body
    const { complaintID } = req.params;

    if (!complaintID) {
        throw new AppError("Complaint ID is required", 400);
    }
    const result = await deletecomplaintservice(complaintID, req.user.id);

    return successResponse(res, {
        statusCode: 200,
        message: "Complaint deleted successfully",
        data: result,
    })
});

export const getcomplaint = asyncHandler(async (req, res) => {
    //  Accept pagination params from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getcomplaintservice(req.user.id, page, limit);
    return successResponse(res, {
        statusCode: 200,
        message: "Complaints retrieved successfully",
        data: result,
    })
})

export const updatecomplaint = asyncHandler(async (req, res) => {
    const { complaintID, title, description } = req.body;

    if (!complaintID || !title || !description) {
        throw new AppError("All fields are required", 400);
    }
    const result = await updatecomplaintservice(complaintID, title, description, req.user.id);

    return successResponse(res, {
        statusCode: 200,
        message: "Complaint updated successfully",
        data: result,
    })
});

export const updatecomplaintstatus = asyncHandler(async (req, res) => {
    const { complaintID, status } = req.body;

    if (!complaintID || !status) {
        throw new AppError("All fields are required", 400);
    }
    const result = await updatecomplaintstatusservice(complaintID, status);

    return successResponse(res, {
        statusCode: 200,
        message: "Complaint status updated successfully",
        data: result,
    })
});