/**
 * Unified File Storage
 * Automatically uses AWS S3 when configured, otherwise falls back to local storage
 */

import { isS3Configured } from "./local-storage";
import * as localStorage from "./local-storage";
import * as s3Storage from "./s3";

export interface FileUploadResponse {
  success: boolean;
  fileUrl: string;
  fileKey: string;
  message?: string;
  uploadURL?: string; // For S3 pre-signed URLs
  expiresIn?: number;
}

/**
 * Get file upload configuration
 * Returns S3 pre-signed URL if S3 is configured, otherwise prepares for local upload
 */
export async function getUploadConfig(
  filename: string,
  fileType: string,
  vendorId?: string,
  documentType?: string
): Promise<FileUploadResponse> {
  // Validate file first
  const validation = localStorage.validateFile(fileType);
  if (!validation.isValid) {
    return {
      success: false,
      fileUrl: "",
      fileKey: "",
      message: validation.error,
    };
  }

  // Use S3 if configured
  if (isS3Configured()) {
    try {
      const s3Response = await s3Storage.generatePresignedUploadUrl(
        filename,
        fileType,
        vendorId,
        documentType
      );

      return {
        success: true,
        fileUrl: s3Response.fileKey,
        fileKey: s3Response.fileKey,
        uploadURL: s3Response.uploadURL,
        expiresIn: s3Response.expiresIn,
        message: "S3 upload URL generated",
      };
    } catch (error) {
      console.error("S3 upload config failed, falling back to local:", error);
    }
  }

  // Fallback to local storage indicator
  return {
    success: true,
    fileUrl: "/api/files/upload-local",
    fileKey: "local-upload",
    message: "Use local upload endpoint",
  };
}

/**
 * Save file using available storage method
 */
export async function saveFile(
  file: File,
  vendorId?: string,
  documentType?: string
): Promise<FileUploadResponse> {
  // Always use local storage for direct uploads
  const result = await localStorage.saveFileLocally(
    file,
    vendorId,
    documentType
  );

  return {
    success: result.success,
    fileUrl: result.fileUrl,
    fileKey: result.fileKey,
    message: result.message,
  };
}

/**
 * Save base64 file
 */
export async function saveBase64File(
  base64Data: string,
  filename: string,
  fileType: string,
  vendorId?: string,
  documentType?: string
): Promise<FileUploadResponse> {
  const result = await localStorage.saveBase64FileLocally(
    base64Data,
    filename,
    fileType,
    vendorId,
    documentType
  );

  return {
    success: result.success,
    fileUrl: result.fileUrl,
    fileKey: result.fileKey,
    message: result.message,
  };
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileKey: string): Promise<boolean> {
  // Try S3 first if configured
  if (
    isS3Configured() &&
    !fileKey.startsWith("vendors/") &&
    !fileKey.startsWith("general/")
  ) {
    try {
      // AWS S3 delete logic would go here if needed
      console.log("S3 delete not implemented, using local fallback");
    } catch (error) {
      console.error("S3 delete failed:", error);
    }
  }

  // Use local storage
  return await localStorage.deleteLocalFile(fileKey);
}

/**
 * Get storage type being used
 */
export function getStorageType(): "s3" | "local" {
  return isS3Configured() ? "s3" : "local";
}

/**
 * Validate file before upload
 */
export function validateFile(fileType: string, fileSize?: number) {
  return localStorage.validateFile(fileType, fileSize);
}
