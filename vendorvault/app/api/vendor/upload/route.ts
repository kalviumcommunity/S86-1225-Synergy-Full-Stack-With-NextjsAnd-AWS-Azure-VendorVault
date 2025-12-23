import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { getUploadConfig, saveBase64File } from "@/lib/file-storage";
// AWS S3 functions are kept for future use but not actively used
// import { generatePresignedUploadUrl, validateFile, getFileUrl } from "@/lib/s3";

/**
 * POST /api/vendor/upload
 * Generate upload configuration (S3 pre-signed URL or local upload endpoint)
 *
 * This endpoint validates the file and returns upload instructions
 * Uses S3 when configured, otherwise falls back to local storage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { filename, fileType, fileSize, vendorId, documentType, base64Data } =
      body;

    // Validate required fields
    if (!filename || !fileType) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: !filename ? ["filename"] : ["fileType"],
        message: "Filename and fileType are required",
      });
    }

    // If base64 data is provided, save directly
    if (base64Data) {
      const result = await saveBase64File(
        base64Data,
        filename,
        fileType,
        vendorId,
        documentType
      );

      if (!result.success) {
        return ApiErrors.BAD_REQUEST(result.message || "Failed to upload file");
      }

      return successResponse(
        {
          fileUrl: result.fileUrl,
          fileKey: result.fileKey,
          message: result.message,
        },
        "File uploaded successfully",
        undefined,
        200
      );
    }

    // Get upload configuration (S3 or local)
    const uploadConfig = await getUploadConfig(
      filename,
      fileType,
      vendorId,
      documentType
    );

    if (!uploadConfig.success) {
      return ApiErrors.BAD_REQUEST(uploadConfig.message || "Invalid file");
    }

    return successResponse(
      uploadConfig,
      "Upload configuration generated successfully",
      undefined,
      200
    );
  } catch (error) {
    console.error("Error generating upload config:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "UPLOAD_CONFIG_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to generate upload configuration");
  }
}
