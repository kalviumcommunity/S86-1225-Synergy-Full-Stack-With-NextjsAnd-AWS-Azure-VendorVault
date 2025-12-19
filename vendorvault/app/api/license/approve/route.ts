/**
 * @route POST /api/license/approve
 * @description Approve a license application
 * @access Private (Admin only)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { approveLicense } from "@/services/license.service";
import { licenseApproveSchema } from "@/lib/schemas/licenseSchema";
import { validateRequestData } from "@/lib/validation";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod
    const validation = await validateRequestData(request, licenseApproveSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;

    // Approve license
    const license = await approveLicense({
      licenseId: request.nextUrl.searchParams.get("licenseId")
        ? Number(request.nextUrl.searchParams.get("licenseId"))
        : 0,
      approvedById: body.approvedById,
      expiresAt: new Date(body.expiresAt),
    });

    // Invalidate licenses cache after approval
    try {
      const keys = await redis.keys("licenses:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log("🗑️ Licenses cache invalidated after approval");
      }
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate licenses cache:", redisError);
    }

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
      return errorResponse(error.message, "APPROVAL_ERROR", 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to approve license");
  }
}
