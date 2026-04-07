import { prisma } from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import { logger } from '../../utils/logger.js';


// ✅ GET PROFILE
export const getMeService = async (userId) => {

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            room: { select: { roomNo: true } },
            userDetails: true
        }
    });

    if (!user) throw new AppError("User not found", 404);

    return user;
};




export const updateMeService = async (userId, body) => {

    const {
        name, phone,
        fatherName, fatherPhone, fatherProfession,
        motherName, motherPhone, motherProfession,
        parentAddress, permanentPhone
    } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;


    const userDetailsData = {};

    if (fatherName !== undefined) userDetailsData.fatherName = fatherName;
    if (fatherPhone !== undefined) userDetailsData.fatherPhone = fatherPhone;
    if (fatherProfession !== undefined) userDetailsData.fatherProfession = fatherProfession;

    if (motherName !== undefined) userDetailsData.motherName = motherName;
    if (motherPhone !== undefined) userDetailsData.motherPhone = motherPhone;
    if (motherProfession !== undefined) userDetailsData.motherProfession = motherProfession;

    if (parentAddress !== undefined) userDetailsData.parentAddress = parentAddress;
    if (permanentPhone !== undefined) userDetailsData.permanentPhone = permanentPhone;

    try {

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...updateData,
                ...(Object.keys(userDetailsData).length > 0 && {
                    userDetails: {
                        upsert: {
                            create: userDetailsData,
                            update: userDetailsData
                        }
                    }
                })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                userDetails: true
            }
        });

        logger.info("Profile updated", { userId });

        return updatedUser;

    } catch (error) {

        logger.error("Profile update failed", {
            userId,
            error: error.message
        });

        throw error;
    }
};



// ✅ FEES
export const getUserFeesService = async (userId, page, limit) => {

    const skip = (page - 1) * limit;

    const [fees, total] = await Promise.all([
        prisma.monthlyFee.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.monthlyFee.count({ where: { userId } })
    ]);

    return {
        fees,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};



// ✅ PROFILE REQUEST
export const requestProfileUpdateService = async (userId, body) => {

    const { changes, reason } = body;

    if (!changes || Object.keys(changes).length === 0) {
        throw new AppError("No changes provided", 400);
    }

    if (!reason) {
        throw new AppError("Reason required", 400);
    }

    const request = await prisma.profileUpdateRequest.create({
        data: {
            userId,
            requestedChanges: changes,
            reason,
            status: "PENDING"
        }
    });

    logger.info("Profile update requested", { userId });

    return request;
};