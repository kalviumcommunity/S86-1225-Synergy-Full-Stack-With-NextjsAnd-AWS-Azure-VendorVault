import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { uploadToS3 } from "@/lib/s3";

/**
 * POST /api/vendor/upload
 * Upload vendor documents (Aadhaar, PAN, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const vendorId = formData.get("vendorId") as string | null;
    const documentType = formData.get("documentType") as string | null;

    // Validate required fields
    if (!file || !vendorId || !documentType) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: !file
          ? ["file"]
          : !vendorId
            ? ["vendorId"]
            : ["documentType"],
        message: "File, vendorId, and documentType are required",
      });
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return ApiErrors.BAD_REQUEST("File size exceeds 5MB limit");
    }

    // Upload to S3 or storage
    const fileUrl = await uploadToS3(file, vendorId, documentType);

    return successResponse(
      {
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        documentType,
      },
      "File uploaded successfully",
      undefined,
      201
    );
  } catch (error) {
    console.error("Error uploading file:", error);

    if (error instanceof Error) {
      return errorResponse("UPLOAD_ERROR", error.message, 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to upload file");
  }
}
