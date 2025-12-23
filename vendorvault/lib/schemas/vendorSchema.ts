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

  // Personal Information
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  alternatePhone: z.string().optional().nullable(),
  dateOfBirth: z.string(),
  gender: z.string().optional().nullable(),
  aadharNumber: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits"),

  // Business Information
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),
  businessType: z.string(),
  businessAddress: z.string().max(500),
  city: z.string().max(50),
  state: z.string().max(50),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  gstNumber: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  yearsInBusiness: z.string().optional().nullable(),

  // Railway Station Information
  preferredStation: z
    .string()
    .min(2, "Station name must be at least 2 characters")
    .max(100, "Station name must not exceed 100 characters"),
  stationType: z.string(),
  shopNumber: z.string().optional().nullable(),
  platformNumber: z.string().optional().nullable(),
  shopArea: z.string().optional().nullable(),

  // Product/Service Information
  productCategory: z.string(),
  productDescription: z.string().max(1000),
  estimatedDailySales: z.string().optional().nullable(),
  operatingHours: z.string().optional().nullable(),

  // Document URLs (uploaded separately)
  aadharUrl: z.string().optional().nullable(),
  panUrl: z.string().optional().nullable(),
  gstUrl: z.string().optional().nullable(),
  businessProofUrl: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  shopPhotosUrl: z.string().optional().nullable(),

  // Bank Information
  bankName: z.string().max(100),
  accountNumber: z.string(),
  ifscCode: z.string().max(11),
  accountHolderName: z.string().max(100),
  branchName: z.string().optional().nullable(),

  // Declarations
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "Must agree to terms"),
  declarationAccurate: z
    .boolean()
    .refine((val) => val === true, "Must declare accuracy"),
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
