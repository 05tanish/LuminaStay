import { z } from "zod";

//  Zod validation schemas for hostel operations

export const createHostelSchema = z.object({
  name: z.string().min(2, "Hostel name must be at least 2 characters").max(100),
  address: z.string().min(5, "Address must be at least 5 characters").max(500),
});

export const updateHostelSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().min(5).max(500).optional(),
}).refine(data => data.name || data.address, {
  message: "At least one field (name or address) must be provided",
});

export const transferHostelSchema = z.object({
  targetHostelId: z.string().uuid("Invalid target hostel ID format")
}); 
export const getHostelStatsSchema = z.object({
  id: z.string().uuid("Invalid hostel ID format")
});
export const idparamsSchema = z.object({
  id: z.string().uuid("Invalid ID format")
});