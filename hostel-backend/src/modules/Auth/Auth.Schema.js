import { z } from "zod";

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  password: z.string().min(6, "Password must be at least 6 characters"),
  code: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Google login schema
export const googleLoginSchema = z.object({
  token: z.string().min(1, "Google token is required"),
});

// Google register schema — email comes from Google token, no OTP needed
export const googleRegisterSchema = z.object({
  token: z.string().min(1, "Google token is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  code: z.string().optional(),
});

// Send OTP schema
export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Verify OTP schema
export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(4, "OTP code is required").max(10),
});
