import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export const complaintservice = async (title, description, userid) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userid,
        }
    })
    if (!user) {
        throw new AppError("User not found", 404);
    }
    const createcomplaint = await prisma.complaint.create({
        data: {
            userId: userid,
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
    })
    return createcomplaint;
};

//  Added authorization: only the owner can delete their own complaint.
export const deletecomplaintservice = async (complaintID, userid) => {
    // we verify ownership via the complaint's userId instead. This also prevents a user from deleting
    // another user's complaint.
    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintID }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }

    //  Authorization check — ensure the user owns this complaint
    if (complaint.userId !== userid) {
        throw new AppError("You can only delete your own complaints", 403);
    }

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
    return deletecomplaint;
}

export const getcomplaintservice = async (userid, page = 1, limit = 20) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userid,
        }
    })
    if (!user) {
        throw new AppError("User not found", 404);
    }

    //  Added pagination — previously returned ALL complaints at once
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

//  Added ownership check
export const updatecomplaintservice = async (complaintID, title, description, userid) => {
    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintID }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }

    if (complaint.userId !== userid) {
        throw new AppError("You can only update your own complaints", 403);
    }

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
    return updatecomplaint;
}

// Added validation for allowed status values
const ALLOWED_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export const updatecomplaintstatusservice = async (complaintID, status) => {
    //  Validate status enum before sending to DB
    if (!ALLOWED_STATUSES.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`, 400);
    }

    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintID }
    });

    if (!complaint) {
        throw new AppError("Complaint not found", 404);
    }

    const updatecomplaintstatus = await prisma.complaint.update({
        where: {
            id: complaintID
        },
        data: {
            status
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
        }
    })
    return updatecomplaintstatus;
}
