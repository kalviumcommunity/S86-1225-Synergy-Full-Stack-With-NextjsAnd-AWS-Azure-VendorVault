/**
 * @route POST /api/license/approve
 * @description Approve a license application
 * @access Private (Admin only)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { approveLicense } from "@/services/license.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["licenseId", "approvedById", "expiresAt"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate expiresAt is a valid date
    const expiresAt = new Date(body.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      return ApiErrors.BAD_REQUEST("Invalid expiration date format");
    }

    // Check if expiresAt is in the future
    if (expiresAt <= new Date()) {
      return ApiErrors.BAD_REQUEST("Expiration date must be in the future");
    }

    // Approve license
    const license = await approveLicense({
      licenseId: Number(body.licenseId),
      approvedById: Number(body.approvedById),
      expiresAt,
    });

    return successResponse(license, "License approved successfully");
  } catch (error) {
    console.error("Error approving license:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return ApiErrors.NOT_FOUND("License");
      }
      if (error.message.includes("already approved")) {
        return ApiErrors.CONFLICT(error.message);
      }
      return errorResponse("APPROVAL_ERROR", error.message, 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to approve license");
  }
}
