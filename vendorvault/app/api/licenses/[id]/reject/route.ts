/**
 * @route POST /api/licenses/[id]/reject
 * @description Reject a license application
 * @access Private (Admin only)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { rejectLicense } from "@/services/license.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const licenseId = Number(id);

    if (isNaN(licenseId)) {
      return ApiErrors.BAD_REQUEST("Invalid license ID");
    }

    const body = await request.json();

    // Validate required fields
    if (!body.rejectionReason) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: ["rejectionReason"],
        message: "Rejection reason is required",
      });
    }

    // Reject license
    const license = await rejectLicense({
      licenseId,
      rejectionReason: body.rejectionReason,
    });

    return successResponse(license, "License rejected successfully");
  } catch (error) {
    console.error("Error rejecting license:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return ApiErrors.NOT_FOUND("License");
      }
      return errorResponse(error.message, "REJECTION_ERROR", 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to reject license");
  }
}
