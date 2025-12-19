import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

/**
 * POST /api/files
 * Store file metadata in database after successful upload to S3
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      fileName,
      fileUrl,
      fileKey,
      fileSize,
      mimeType,
      vendorId,
      documentType,
    } = body;

    // Validate required fields
    if (!fileName || !fileUrl || !fileKey || !vendorId) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: [],
        message: "fileName, fileUrl, fileKey, and vendorId are required",
      });
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(vendorId) },
    });

    if (!vendor) {
      return ApiErrors.NOT_FOUND("Vendor not found");
    }

    // Create file record in database
    const fileRecord = await prisma.document.create({
      data: {
        vendorId: parseInt(vendorId),
        documentType: documentType || DocumentType.OTHER,
        fileName,
        fileUrl,
        storageKey: fileKey,
        fileSize: fileSize ? parseInt(fileSize) : null,
        mimeType: mimeType || null,
        storageBucket: process.env.AWS_BUCKET_NAME || "vendorvault-uploads",
        status: "PENDING",
      },
    });

    return successResponse(
      {
        file: {
          id: fileRecord.id,
          fileName: fileRecord.fileName,
          fileUrl: fileRecord.fileUrl,
          fileKey: fileRecord.storageKey,
          uploadedAt: fileRecord.uploadedAt,
        },
      },
      "File metadata stored successfully",
      undefined,
      201
    );
  } catch (error) {
    console.error("Error storing file metadata:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "FILE_STORAGE_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to store file metadata");
  }
}

/**
 * GET /api/files
 * Retrieve file metadata (optionally filtered by vendorId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    const files = await prisma.document.findMany({
      where: vendorId ? { vendorId: parseInt(vendorId) } : {},
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        documentType: true,
        status: true,
        uploadedAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    return successResponse(
      { files, count: files.length },
      "Files retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving files:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "FILE_RETRIEVAL_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to retrieve files");
  }
}
