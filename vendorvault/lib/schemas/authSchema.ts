/**
 * Authentication Validation Schemas
 * Used for validating login credentials
 */

import { z } from "zod";

/**
 * Login Schema
 * Validates email and password for authentication
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration Schema
 * Validates user registration data
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  role: z.enum(["VENDOR", "ADMIN", "INSPECTOR"], {
    errorMap: () => ({ message: "Role must be VENDOR, ADMIN, or INSPECTOR" }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
