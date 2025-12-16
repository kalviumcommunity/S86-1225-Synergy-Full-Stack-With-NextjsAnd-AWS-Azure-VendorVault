import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { generateQRCode } from "@/lib/qr";

/**
 * POST /api/license/generate-qr
 * Generate QR code for a license
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.licenseNumber) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: ["licenseNumber"],
        message: "License number is required",
      });
    }

    // Generate QR code
    const qrCodeUrl = await generateQRCode(body.licenseNumber);

    return successResponse(
      { qrCodeUrl, licenseNumber: body.licenseNumber },
      "QR code generated successfully",
      undefined,
      201
    );
  } catch (error) {
    console.error("Error generating QR code:", error);

    if (error instanceof Error) {
      return errorResponse("QR_GENERATION_ERROR", error.message, 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to generate QR code");
  }
}
