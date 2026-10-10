import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});
