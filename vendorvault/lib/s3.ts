/**
 * AWS S3 upload utilities with pre-signed URLs
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "vendorvault-uploads";

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PreSignedUrlResponse {
  uploadURL: string;
  fileKey: string;
  expiresIn: number;
}

/**
 * Validate file type and size
 */
export function validateFile(
  fileType: string,
  fileSize?: number
): FileValidationResult {
  // Check file type
  if (!ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES]) {
    return {
      isValid: false,
      error: `Unsupported file type: ${fileType}. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(", ")}`,
    };
  }

  // Check file size if provided
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds limit. Max allowed: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Generate a pre-signed URL for file upload to S3
 */
export async function generatePresignedUploadUrl(
  filename: string,
  fileType: string,
  vendorId?: string,
  documentType?: string
): Promise<PreSignedUrlResponse> {
  // Create unique file key
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  const fileKey =
    vendorId && documentType
      ? `vendors/${vendorId}/${documentType}/${timestamp}_${randomStr}_${sanitizedFilename}`
      : `uploads/${timestamp}_${randomStr}_${sanitizedFilename}`;

  // Create PutObject command
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  // Generate pre-signed URL (expires in 60 seconds)
  const expiresIn = 60;
  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    uploadURL,
    fileKey,
    expiresIn,
  };
}

/**
 * Get public URL for uploaded file
 */
export function getFileUrl(fileKey: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${fileKey}`;
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generatePresignedUploadUrl instead
 */
export async function uploadToS3(
  file: File,
  vendorId: string,
  documentType: string
): Promise<string> {
  const fileName = `${vendorId}/${documentType}_${Date.now()}_${file.name}`;
  return `https://s3.amazonaws.com/vendorvault/${fileName}`;
}
