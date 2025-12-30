import { NextRequest } from "next/server";
import { generatePresignedUploadUrl, validateFile } from "@/lib/s3";
import { errorResponse, successResponse, ApiErrors } from "@/lib/api-response";

/**
 * GET /api/files/upload-url
 * Generate presigned URL for direct S3 upload
 *
 * Query Parameters:
 * - fileName: Name of the file to upload
 * - fileType: MIME type of the file
 * - fileSize: Size of file in bytes (optional, for validation)
 * - vendorId: Vendor ID (optional, for organizing files)
 * - documentType: Type of document (optional, e.g., 'license', 'permit')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const fileSize = searchParams.get("fileSize");
    const vendorId = searchParams.get("vendorId");
    const documentType = searchParams.get("documentType");

    // Validate required parameters
    if (!fileName || !fileType) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: ["fileName", "fileType"],
        message: "fileName and fileType are required query parameters",
      });
    }

    // Validate file type and size
    const validation = validateFile(
      fileType,
      fileSize ? parseInt(fileSize) : undefined
    );

    if (!validation.isValid) {
      return errorResponse(
        validation.error || "File validation failed",
        "INVALID_FILE",
        400
      );
    }

    // Check if S3 is configured
    const isS3Configured =
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_BUCKET_NAME;

    if (!isS3Configured) {
      return errorResponse(
        "S3 storage is not configured. Please set AWS credentials in environment variables.",
        "S3_NOT_CONFIGURED",
        503
      );
    }

    // Generate presigned URL
    const result = await generatePresignedUploadUrl(
      fileName,
      fileType,
      vendorId || undefined,
      documentType || undefined
    );

    return successResponse(
      {
        uploadUrl: result.uploadURL,
        fileKey: result.fileKey,
        expiresIn: result.expiresIn,
        fileName,
        fileType,
      },
      "Presigned upload URL generated successfully"
    );
  } catch (error) {
    console.error("Error generating presigned URL:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "PRESIGNED_URL_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to generate upload URL");
  }
}

/**
 * POST /api/files/upload-url
 * Alternative endpoint for generating presigned URLs via POST
 * Useful when file metadata is too large for query parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, vendorId, documentType } = body;

    // Validate required fields
    if (!fileName || !fileType) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: ["fileName", "fileType"],
        message: "fileName and fileType are required in request body",
      });
    }

    // Validate file
    const validation = validateFile(fileType, fileSize);
    if (!validation.isValid) {
      return errorResponse(
        validation.error || "File validation failed",
        "INVALID_FILE",
        400
      );
    }

    // Check S3 configuration
    const isS3Configured =
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_BUCKET_NAME;

    if (!isS3Configured) {
      return errorResponse(
        "S3 storage is not configured",
        "S3_NOT_CONFIGURED",
        503
      );
    }

    // Generate presigned URL
    const result = await generatePresignedUploadUrl(
      fileName,
      fileType,
      vendorId,
      documentType
    );

    return successResponse(
      {
        uploadUrl: result.uploadURL,
        fileKey: result.fileKey,
        expiresIn: result.expiresIn,
        fileName,
        fileType,
      },
      "Presigned upload URL generated successfully",
      undefined,
      201
    );
  } catch (error) {
    console.error("Error generating presigned URL:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "PRESIGNED_URL_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to generate upload URL");
  }
}
