import { z } from "zod";

//  Zod validation schemas for food/menu operations

const mealItemSchema = z.object({
  type: z.enum(["BREAKFAST", "LUNCH", "DINNER"]),
  items: z.array(z.string().min(1)).min(1, "Each meal must have at least one item"),
});

export const upsertMenuSchema = z.object({
  date: z.string().min(1, "Date is required"),
  meals: z.array(mealItemSchema).min(1, "At least one meal is required"),
});

export const weeklyMenuSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  menus: z.array(z.object({
    day: z.number().int().min(0).max(6),
    meals: z.array(mealItemSchema).min(1),
  })).min(1, "At least one daily menu is required"),
});
