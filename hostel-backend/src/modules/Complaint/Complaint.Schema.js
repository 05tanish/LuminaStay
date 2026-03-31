import { z } from "zod";

//  Zod validation schemas for complaint operations

export const createComplaintSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
});

export const updateComplaintSchema = z.object({
  complaintID: z.string().uuid("Invalid complaint ID"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
});

export const updateComplaintStatusSchema = z.object({
  complaintID: z.string().uuid("Invalid complaint ID"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});
