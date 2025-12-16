/**
 * License Validation Schemas
 * Used for validating license-related API requests
 */

import { z } from "zod";

/**
 * License Creation Schema
 * Validates new license creation data
 */
export const licenseCreateSchema = z.object({
  vendorId: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .refine((n) => n > 0, "Vendor ID must be positive"),
  licenseNumber: z
    .string()
    .min(3, "License number must be at least 3 characters")
    .max(50, "License number must not exceed 50 characters")
    .regex(
      /^[A-Z0-9\-]+$/,
      "License number must contain only uppercase letters, numbers, and hyphens"
    ),
  isRenewal: z.boolean().optional().default(false),
  previousLicenseId: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .optional()
    .nullable(),
});

export type LicenseCreateInput = z.infer<typeof licenseCreateSchema>;

/**
 * License Update Schema
 * Validates license updates
 */
export const licenseUpdateSchema = z.object({
  expiresAt: z
    .string()
    .datetime("Invalid date format")
    .refine(
      (date) => new Date(date) > new Date(),
      "Expiry date must be in the future"
    )
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .optional()
    .nullable(),
});

export type LicenseUpdateInput = z.infer<typeof licenseUpdateSchema>;

/**
 * License Approval Schema
 * Validates license approval request
 */
export const licenseApproveSchema = z.object({
  approvedById: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .refine((n) => n > 0, "Approver ID must be positive"),
  expiresAt: z
    .string()
    .datetime("Invalid date format")
    .refine(
      (date) => new Date(date) > new Date(),
      "Expiry date must be in the future"
    ),
  notes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .optional()
    .nullable(),
});

export type LicenseApproveInput = z.infer<typeof licenseApproveSchema>;

/**
 * License Rejection Schema
 * Validates license rejection request
 */
export const licenseRejectSchema = z.object({
  rejectedById: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .refine((n) => n > 0, "Rejector ID must be positive"),
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must not exceed 500 characters"),
});

export type LicenseRejectInput = z.infer<typeof licenseRejectSchema>;

/**
 * QR Code Generation Schema
 * Validates QR code generation request
 */
export const qrGenerateSchema = z.object({
  licenseId: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .refine((n) => n > 0, "License ID must be positive"),
  size: z
    .number()
    .min(100, "QR code size must be at least 100px")
    .max(2000, "QR code size must not exceed 2000px")
    .optional()
    .default(200),
});

export type QRGenerateInput = z.infer<typeof qrGenerateSchema>;
