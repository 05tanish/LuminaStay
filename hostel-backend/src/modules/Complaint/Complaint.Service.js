import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export const complaintservice = async(title,description,userid)=>{
    const user = await prisma.user.findUnique({
        where:userid,
    })
    if(!user){
        throw new AppError("User not found",200);
    }
    const createcomplaint = await prisma.complaint.create({
        data:{
            title,
            description
        },
        select:{
title:true,
description:true,
        }
    })
    return createcomplaint;
};

export const deletecomplaintservice = async(complaintID, userid)=>{
    const user = await prisma.user.findUnique({
        where:userid,
    })
    if(!user){
        throw new AppError("User not found",200);
    }
    const deletecomplaint = await prisma.complaint.delete({
        where:{
            id:complaintID
        },
        select:{
            title:true,
            description:true,
        }
    })
    return deletecomplaint;
}

export const getcomplaintservice = async(userid)=>{
    const user = await prisma.user.findUnique({
        where:userid,})
        if(!user){
            throw new AppError("User not found",200);
        }
    const complaints = await prisma.complaint.findMany({
        where:{
            userId:userid,
        },
        select:{
            title:true,
            description:true,
        }
    })
    return complaints;
}
 export const updatecomplaintservice = async(complaintID,title,description, userid)=>{
    const user = await prisma.user.findUnique({
        where:userid,
    })
    if(!user){
        throw new AppError("User not found",200);
    }
    const updatecomplaint = await prisma.complaint.update({
        where:{
            id:complaintID
        },
        data:{
            title,
            description
        },
        select:{
            title:true,
            description:true,
        }
    })
    return updatecomplaint;
}   

 export const updatecomplaintstatusservice = async(complaintID,status)=>{
    const updatecomplaintstatus = await prisma.complaint.update({
        where:{
            id:complaintID
        },
        data:{
            status
        },
        select:{
            title:true,
            description:true,
            status:true,
        }
    })
    return updatecomplaintstatus;
 }
