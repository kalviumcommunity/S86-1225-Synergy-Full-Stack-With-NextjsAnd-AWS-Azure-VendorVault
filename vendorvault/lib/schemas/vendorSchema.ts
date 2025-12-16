/**
 * Vendor Validation Schemas
 * Used for validating vendor-related API requests
 */

import { z } from "zod";

/**
 * Vendor Application Schema
 * Validates vendor application/registration data
 */
export const vendorApplySchema = z.object({
  userId: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .refine((n) => n > 0, "User ID must be positive"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),
  stallType: z.enum(
    [
      "TEA_STALL",
      "SNACKS",
      "BOOKSHOP",
      "NEWSPAPER",
      "GIFTS_SOUVENIRS",
      "OTHER",
    ],
    {
      errorMap: () => ({ message: "Invalid stall type" }),
    }
  ),
  stationName: z
    .string()
    .min(2, "Station name must be at least 2 characters")
    .max(100, "Station name must not exceed 100 characters"),
  stallDescription: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
  platformNumber: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .optional()
    .nullable(),
  stallLocationDescription: z
    .string()
    .max(300, "Location description must not exceed 300 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, "Address must not exceed 200 characters")
    .optional()
    .nullable(),
  city: z
    .string()
    .max(50, "City must not exceed 50 characters")
    .optional()
    .nullable(),
  state: z
    .string()
    .max(50, "State must not exceed 50 characters")
    .optional()
    .nullable(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .optional()
    .nullable(),
});

export type VendorApplyInput = z.infer<typeof vendorApplySchema>;

/**
 * Vendor Update Schema
 * Validates vendor profile updates
 */
export const vendorUpdateSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters")
    .optional(),
  stallType: z
    .enum([
      "TEA_STALL",
      "SNACKS",
      "BOOKSHOP",
      "NEWSPAPER",
      "GIFTS_SOUVENIRS",
      "OTHER",
    ])
    .optional(),
  stationName: z
    .string()
    .min(2, "Station name must be at least 2 characters")
    .max(100, "Station name must not exceed 100 characters")
    .optional(),
  stallDescription: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
  platformNumber: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .optional()
    .nullable(),
  stallLocationDescription: z
    .string()
    .max(300, "Location description must not exceed 300 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, "Address must not exceed 200 characters")
    .optional()
    .nullable(),
  city: z
    .string()
    .max(50, "City must not exceed 50 characters")
    .optional()
    .nullable(),
  state: z
    .string()
    .max(50, "State must not exceed 50 characters")
    .optional()
    .nullable(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .optional()
    .nullable(),
});

export type VendorUpdateInput = z.infer<typeof vendorUpdateSchema>;

/**
 * Vendor KYC Update Schema
 * Validates KYC document submission
 */
export const vendorKYCSchema = z.object({
  kycNumber: z
    .string()
    .min(1, "KYC number is required")
    .max(50, "KYC number must not exceed 50 characters"),
  kycType: z.enum(["AADHAAR", "PAN", "VOTER_ID", "PASSPORT"], {
    errorMap: () => ({ message: "Invalid KYC type" }),
  }),
  kycDocumentUrl: z.string().url("Invalid document URL").optional(),
});

export type VendorKYCInput = z.infer<typeof vendorKYCSchema>;

/**
 * Document Upload Schema
 * Validates document upload metadata
 */
export const documentUploadSchema = z.object({
  vendorId: z
    .union([z.number(), z.string().regex(/^\d+$/, "Must be a valid number")])
    .transform(Number)
    .refine((n) => n > 0, "Vendor ID must be positive"),
  documentType: z.enum(
    ["LICENSE", "CERTIFICATE", "REGISTRATION", "INSURANCE", "OTHER"],
    {
      errorMap: () => ({ message: "Invalid document type" }),
    }
  ),
  documentName: z
    .string()
    .min(1, "Document name is required")
    .max(200, "Document name must not exceed 200 characters"),
  documentUrl: z.string().url("Invalid document URL"),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
