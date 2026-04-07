import { z } from "zod";

//  Zod validation schemas for admin operations.

export const addUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF", "USER"]),
});

export const updateRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});
export const getUsersSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
});
export const deleteUserSchema = z.object({
  userID: z.string().uuid("Invalid user ID"),
});

export const createMonthlyFeeSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  amount: z.number().positive("Amount must be a positive number"),
  dueDate: z.string().min(1, "Due date is required"),
});

export const updateProfileRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminComment: z.string().max(500).optional(),
});
