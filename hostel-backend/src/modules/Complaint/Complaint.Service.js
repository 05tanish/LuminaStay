import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";
import { auditLog } from "../../utils/audit.js";

// create the complaints
export const complaintService = async (title, description, userId) => {

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (!user.hostelId) {
        throw new AppError("User is not assigned to a hostel", 400);
    }
    try {
        const complaint = await prisma.complaint.create({
            data: {
                userId,
                hostelId: user.hostelId,
                title,
                description
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                createdAt: true
            }
        });
        logger.info("Complaint created", {
            complaintId: complaint.id,
            userId,
            userRole: user.role,
            title: complaint.title
        });

        return complaint;
    } catch (error) {
        logger.error("Complaint creation failed", {
            userId,
            title,
            error: error.message
        });

        throw new AppError("Failed to create complaint", 500);
    }
};

// delete the complaints 
export const deleteComplaintService = async (complaintID, userid, user) => {

    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintID }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }

    const isOwner = complaint.userId === userid;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);

    // SUPER_ADMIN can only delete complaints from their own hostels
    if (user.role === "SUPER_ADMIN") {
        const ownership = await prisma.userHostel.findFirst({
            where: { userId: user.id, hostelId: complaint.hostelId }
        });
        if (!ownership) {
            throw new AppError("Not authorized to delete this complaint", 403);
        }
    }

    if (!isOwner && !isAdmin) {
        throw new AppError("Not authorized to delete this complaint", 403);
    }
    try {
        const deletecomplaint = await prisma.complaint.delete({
            where: {
                id: complaintID
            },
            select: {
                id: true,
                title: true,
                description: true,
            }
        })

        logger.info("Complaint Deleted", {
            complaintID,
            userid,
            userRole: user.role,
            title: complaint.title

        })
        return deletecomplaint;
    } catch (error) {
        logger.error("Complaint deletion failed", {
            complaintID,
            userid,
            error: error.message
        });

        throw new AppError("Failed to delete complaint", 500);
    }
};

export const getComplaintService = async (userid, page = 1, limit = 20) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userid,
        }
    })
    if (!user) {
        throw new AppError("User not found", 404);
    }


    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
            where: {
                userId: userid,
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                createdAt: true
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma.complaint.count({ where: { userId: userid } })
    ]);
    return {
        complaints,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

// update complaint 
export const updateComplaintService = async (complaintID, title, description, userid) => {
    if (!complaintID || !title || !description) {
        throw new AppError("All fields are required", 400);
    }
    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintID }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }

    if (complaint.userId !== userid) {
        throw new AppError("You can only update your own complaints", 403);
    }
    if (["RESOLVED", "CLOSED"].includes(complaint.status)) {
        throw new AppError("Cannot update resolved complaints", 400);
    }
    try {
        const updatecomplaint = await prisma.complaint.update({
            where: {
                id: complaintID
            },
            data: {
                title,
                description
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
            }
        })
        logger.info("Complaint updated", {
            complaintID,
            userid,
            oldTitle: complaint.title,
            newTitle: updatecomplaint.title
        });
        return updatecomplaint;
    } catch (error) {
        logger.error("Complaint update failed", {
            complaintID,
            userid,
            error: error.message
        });

        throw new AppError("Failed to update complaint", 500);

    }
};

// update complaint stats
const ALLOWED_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export const updateComplaintStatusService = async (
    complaintId,
    status,
    actor
) => {
    if (!ALLOWED_STATUSES.includes(status)) {
        throw new AppError(
            `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
            400
        );
    }

    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }
    if (!["ADMIN", "SUPER_ADMIN"].includes(actor.role)) {
        throw new AppError("Not authorized to update complaint status", 403);
    }

    // SUPER_ADMIN can only update complaints from their own hostels
    if (actor.role === "SUPER_ADMIN") {
        const ownership = await prisma.userHostel.findFirst({
            where: { userId: actor.id, hostelId: complaint.hostelId }
        });
        if (!ownership) {
            throw new AppError("Not authorized to update this complaint", 403);
        }
    }

    if (complaint.status === status) {
        throw new AppError("Complaint already has this status", 400);
    }
    const validTransitions = {
        OPEN: ["IN_PROGRESS"],
        IN_PROGRESS: ["RESOLVED"],
        RESOLVED: []
    };
    if (!validTransitions[complaint.status].includes(status)) {
        throw new AppError(
            `Invalid status transition from ${complaint.status} to ${status}`,
            400
        );
    }
    try {
        const updatedComplaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: { status },
            select: {
                id: true,
                title: true,
                status: true
            }
        });
        logger.info("Complaint status updated", {
            complaintId,
            actorId: actor.id,
            actorRole: actor.role,
            oldStatus: complaint.status,
            newStatus: status
        });
        auditLog({
            action: "COMPLAINT_STATUS_UPDATED",
            actorId: actor.id,
            targetId: complaintId,
            details: {
                oldStatus: complaint.status,
                newStatus: status
            }
        });

        return updatedComplaint;

    } catch (error) {
        logger.error("Failed to update complaint status", {
            complaintId,
            actorId: actor.id,
            error: error.message
        });

        throw new AppError("Failed to update complaint status", 500);
    }
};

// get admin complaint service
export const getAdminComplaintsService = async (
    hostelId,
    page = 1,
    limit = 20,
    actor,
    status
) => {
    if (!["ADMIN", "SUPER_ADMIN"].includes(actor.role)) {
        throw new AppError("Not authorized", 403);
    }

    // SUPER_ADMIN can only access complaints from their own hostels
    if (actor.role === "SUPER_ADMIN") {
        const ownership = await prisma.userHostel.findFirst({
            where: { userId: actor.id, hostelId }
        });
        if (!ownership) {
            throw new AppError("Hostel not found in your workspace", 404);
        }
    }

    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const whereClause = {
        hostelId,
        ...(status && { status })
    };

    const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        room: { select: { roomNo: true } }
                    }
                },

                comments: {
                    take: 3,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: { select: { name: true, role: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: safeLimit
        }),

        prisma.complaint.count({ where: whereClause })
    ]);

    logger.info("Admin fetched complaints", {
        actorId: actor.id,
        actorRole: actor.role,
        hostelId,
        page,
        limit: safeLimit,
        status
    });

    return {
        complaints,
        pagination: {
            page,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit)
        }
    };
};

export const getSuperAdminComplaintsService = async (
    page = 1,
    limit = 20,
    actor
) => {


    if (actor.role !== "SUPER_ADMIN") {
        throw new AppError("Not authorized", 403);
    }

    // Get hostel IDs this super admin owns
    const myHostelLinks = await prisma.userHostel.findMany({
        where: { userId: actor.id },
        select: { hostelId: true }
    });
    const myHostelIds = myHostelLinks.map(h => h.hostelId);

    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
            where: {
                hostelId: { in: myHostelIds }
            },
            include: {
                user: {
                    select: { name: true },
                },
                hostel: {
                    select: { name: true }
                },

                comments: {
                    take: 3,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: { select: { name: true, role: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: safeLimit
        }),

        prisma.complaint.count({
            where: {
                hostelId: { in: myHostelIds }
            }
        })
    ]);


    logger.info("SuperAdmin fetched complaints", {
        actorId: actor.id,
        page,
        limit: safeLimit
    });

    return {
        complaints,
        pagination: {
            page,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit)
        }
    };
};
// add comment to complaint 
export const addComplaintCommentService = async (
    complaintId,
    userId,
    content
) => {

    if (!content || content.trim().length === 0) {
        throw new AppError("Comment cannot be empty", 400);
    }

    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }

    const comment = await prisma.complaintComment.create({
        data: {
            complaintId,
            userId,
            content
        },
        include: {
            user: { select: { name: true, role: true } }
        }
    });


    logger.info("Comment added to complaint", {
        complaintId,
        userId
    });

    return comment;
};
// get complaint comments
export const getComplaintCommentsService = async (
    complaintId,
    page = 1,
    limit = 10,
    actor
) => {

    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }

    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const [comments, total] = await Promise.all([
        prisma.complaintComment.findMany({
            where: { complaintId },
            include: {
                user: { select: { name: true, role: true } }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: safeLimit
        }),

        prisma.complaintComment.count({
            where: { complaintId }
        })
    ]);

    logger.info("Fetched complaint comments", {
        actorId: actor.id,
        complaintId,
        page
    });

    return {
        comments,
        pagination: {
            page,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit)
        }
    };
};