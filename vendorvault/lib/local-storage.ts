/**
 * Local File Storage Utilities
 * Fallback for AWS S3 when credentials are not configured
 * Files are stored in /public/uploads directory
 */

import fs from "fs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface LocalFileResponse {
  success: boolean;
  fileUrl: string;
  fileKey: string;
  message?: string;
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
 * Ensure upload directory exists
 */
async function ensureUploadDir(subDir?: string): Promise<string> {
  const targetDir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;

  if (!fs.existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  return targetDir;
}

/**
 * Save file to local storage
 */
export async function saveFileLocally(
  file: File,
  vendorId?: string,
  documentType?: string
): Promise<LocalFileResponse> {
  try {
    // Validate file
    const validation = validateFile(file.type, file.size);
    if (!validation.isValid) {
      return {
        success: false,
        fileUrl: "",
        fileKey: "",
        message: validation.error,
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension =
      ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${randomStr}_${sanitizedName}`;

    // Determine subdirectory
    const subDir =
      vendorId && documentType
        ? `vendors/${vendorId}/${documentType}`
        : "general";

    // Ensure directory exists
    const targetDir = await ensureUploadDir(subDir);

    // Save file
    const filePath = path.join(targetDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Generate public URL
    const fileKey = `${subDir}/${filename}`;
    const fileUrl = `/uploads/${fileKey}`;

    return {
      success: true,
      fileUrl,
      fileKey,
      message: "File uploaded successfully",
    };
  } catch (error) {
    console.error("Error saving file locally:", error);
    return {
      success: false,
      fileUrl: "",
      fileKey: "",
      message: error instanceof Error ? error.message : "Failed to save file",
    };
  }
}

/**
 * Save base64 file to local storage
 */
export async function saveBase64FileLocally(
  base64Data: string,
  filename: string,
  fileType: string,
  vendorId?: string,
  documentType?: string
): Promise<LocalFileResponse> {
  try {
    // Validate file type
    const validation = validateFile(fileType);
    if (!validation.isValid) {
      return {
        success: false,
        fileUrl: "",
        fileKey: "",
        message: validation.error,
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension =
      ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const newFilename = `${timestamp}_${randomStr}_${sanitizedName}${extension}`;

    // Determine subdirectory
    const subDir =
      vendorId && documentType
        ? `vendors/${vendorId}/${documentType}`
        : "general";

    // Ensure directory exists
    const targetDir = await ensureUploadDir(subDir);

    // Convert base64 to buffer
    const base64WithoutPrefix = base64Data.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64WithoutPrefix, "base64");

    // Save file
    const filePath = path.join(targetDir, newFilename);
    await writeFile(filePath, buffer);

    // Generate public URL
    const fileKey = `${subDir}/${newFilename}`;
    const fileUrl = `/uploads/${fileKey}`;

    return {
      success: true,
      fileUrl,
      fileKey,
      message: "File uploaded successfully",
    };
  } catch (error) {
    console.error("Error saving base64 file locally:", error);
    return {
      success: false,
      fileUrl: "",
      fileKey: "",
      message: error instanceof Error ? error.message : "Failed to save file",
    };
  }
}

/**
 * Delete file from local storage
 */
export async function deleteLocalFile(fileKey: string): Promise<boolean> {
  try {
    const filePath = path.join(UPLOAD_DIR, fileKey);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error deleting local file:", error);
    return false;
  }
}

/**
 * Check if AWS S3 is configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME
  );
}
