import { z } from "zod";

//  Zod validation schemas for invite system

export const createInviteSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  role: z.enum(["ADMIN", "STAFF", "USER"]),
  hostelId: z.string().uuid("Invalid hostel ID"),
  type: z.enum(["EMAIL", "OPEN"]),
}).refine(data => {
  // [REVIEW] If type is EMAIL, email is required
  if (data.type === "EMAIL" && !data.email) {
    return false;
  }
  return true;
}, {
  message: "Email is required for EMAIL type invites",
  path: ["email"],
});

export const registerWithInviteSchema = z.object({
  code: z.string().min(1, "Invite code is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
