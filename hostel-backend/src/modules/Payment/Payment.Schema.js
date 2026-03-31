import { z } from "zod";

//  Zod validation schemas for payment operations

export const createOrderSchema = z.object({
  monthlyFeeId: z.string().uuid("Invalid monthly fee ID"),
});

export const cashPaymentSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  monthlyFeeId: z.string().uuid("Invalid monthly fee ID"),
  remarks: z.string().max(500).optional(),
});
