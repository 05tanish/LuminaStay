import { z } from "zod";

// Create hostel schema (reuses Hostel.Schema pattern)
export const createHostelSchema = z.object({
  name: z.string().min(2, "Hostel name must be at least 2 characters").max(100),
  address: z.string().min(5, "Address must be at least 5 characters").max(500),
});

// Assign admin to hostel
export const assignAdminSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  hostelId: z.string().uuid("Invalid hostel ID"),
});

// Reassign admin to different hostel
export const reassignAdminSchema = z.object({
  hostelId: z.string().uuid("Invalid hostel ID"),
});
