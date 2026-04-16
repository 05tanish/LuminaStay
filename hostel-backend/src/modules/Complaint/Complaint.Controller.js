import { AppError } from "../../utils/AppError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
    complaintService,
    deleteComplaintService,
    getComplaintService,
    updateComplaintService,
    updateComplaintStatusService,
    getAdminComplaintsService,
    getSuperAdminComplaintsService,
    addComplaintCommentService,
    getComplaintCommentsService
} from "./Complaint.Service.js"

// create complaint controller
export const createcomplaint = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new AppError("All fields are required", 400);
    }
    const complaint = await complaintService(title, description, req.user.id);

    return successResponse(res, {
        statusCode: 201,
        message: "Complaint created successfully",
        data: complaint,
    })
});

export const deletecomplaint = asyncHandler(async (req, res) => {

    const { complaintID } = req.params;

    if (!complaintID) {
        throw new AppError("Complaint ID is required", 400);
    }
    const result = await deleteComplaintService(complaintID, req.user.id, req.user);

    return successResponse(res, {
        statusCode: 200,
        message: "Complaint deleted successfully",
        data: result,
    })
});

export const getcomplaint = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await getComplaintService(req.user.id, page, limit);
    return successResponse(res, {
        statusCode: 200,
        message: "Complaints retrieved successfully",
        data: result,
    })
})

export const updatecomplaint = asyncHandler(async (req, res) => {
    const { complaintID } = req.params;
    const { title, description } = req.body;
    const result = await updateComplaintService(complaintID, title, description, req.user.id);

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
    const result = await updateComplaintStatusService(complaintID, status, req.user);

    return successResponse(res, {
        statusCode: 200,
        message: "Complaint status updated successfully",
        data: result,
    })
});

export const getAdminComplaints = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    const { status } = req.query;


    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 50) limit = 50;

    if (!req.user.hostelId) {
        throw new AppError("Admin is not assigned to a hostel", 400);
    }

    const result = await getAdminComplaintsService(
        req.user.hostelId, page, limit, req.user, status
    );
    return successResponse(res, {
        statusCode: 200,
        message: "Hostel complaints retrieved successfully",
        data: result,
    });
});

export const getSuperAdminComplaints = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 50) limit = 50;

    const result = await getSuperAdminComplaintsService(
        page,
        limit,
        req.user
    );

    return successResponse(res, {
        statusCode: 200,
        message: "All complaints retrieved",
        data: result,
    });
});

export const addComplaintComment = asyncHandler(async (req, res) => {
    const { complaintID } = req.params;
    const { content } = req.body;

    if (!complaintID || !content) {
        throw new AppError("Complaint ID and content are required", 400);
    }

    const result = await addComplaintCommentService(
        complaintID,
        req.user.id,
        content
    );

    return successResponse(res, {
        statusCode: 201,
        message: "Comment added successfully",
        data: result,
    });
});

export const getComplaintComments = asyncHandler(async (req, res) => {
    const { complaintID } = req.params;

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (!complaintID) {
        throw new AppError("Complaint ID is required", 400);
    }

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const result = await getComplaintCommentsService(
        complaintID,
        page,
        limit,
        req.user
    );

    return successResponse(res, {
        statusCode: 200,
        message: "Comments fetched",
        data: result
    });
});