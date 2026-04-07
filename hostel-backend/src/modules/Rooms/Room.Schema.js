import { z } from "zod";

//  Zod validation schemas for room operations

export const createRoomSchema = z.object({
  roomNo: z.string().min(1, "Room number is required").max(20),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(20),
  // hostelId is injected from the authenticated user's session, not from request body
  hostelId: z.string().uuid("Invalid hostel ID").optional(),
});

export const assignBedSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  bedId: z.string().uuid("Invalid bed ID"),
});

export const vacateBedSchema = z.object({
  bedId: z.string().uuid("Invalid bed ID"),
});
