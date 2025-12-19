import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { generatePresignedUploadUrl, validateFile, getFileUrl } from "@/lib/s3";

/**
 * POST /api/vendor/upload
 * Generate pre-signed URL for secure file upload to S3
 *
 * This endpoint validates the file and returns a temporary URL
 * that allows the client to upload directly to S3
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { filename, fileType, fileSize, vendorId, documentType } = body;

    // Validate required fields
    if (!filename || !fileType) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: !filename ? ["filename"] : ["fileType"],
        message: "Filename and fileType are required",
      });
    }

    // Validate file type and size
    const validation = validateFile(fileType, fileSize);
    if (!validation.isValid) {
      return ApiErrors.BAD_REQUEST(validation.error || "Invalid file");
    }

    // Generate pre-signed URL
    const { uploadURL, fileKey, expiresIn } = await generatePresignedUploadUrl(
      filename,
      fileType,
      vendorId,
      documentType
    );

    // Get the public URL for the file
    const fileUrl = getFileUrl(fileKey);

    return successResponse(
      {
        uploadURL,
        fileUrl,
        fileKey,
        expiresIn,
        message:
          "Pre-signed URL generated. Use PUT request to upload file to uploadURL",
      },
      "Pre-signed URL generated successfully",
      undefined,
      200
    );
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "PRESIGNED_URL_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to generate pre-signed URL");
  }
}
