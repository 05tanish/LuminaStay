import { z } from "zod";

//  Zod validation schemas for notification operations

export const broadcastSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(2000),
});

export const sendUserNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(2000),
  userId: z.string().uuid("Invalid user ID"),
});
