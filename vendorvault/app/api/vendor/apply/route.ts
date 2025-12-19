/**
 * @route POST /api/vendor/apply
 * @description Create a new vendor application
 * @access Private (Authenticated Vendors)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { createVendor } from "@/services/vendor.services";
import { vendorApplySchema } from "@/lib/schemas/vendorSchema";
import { validateRequestData } from "@/lib/validation";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod
    const validation = await validateRequestData(request, vendorApplySchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;

    // Create vendor application
    const vendor = await createVendor({
      userId: body.userId,
      businessName: body.businessName,
      stallType: body.stallType,
      stationName: body.stationName,
      stallDescription: body.stallDescription,
      platformNumber: body.platformNumber,
      stallLocationDescription: body.stallLocationDescription,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
    });

    // Invalidate vendors cache after new application
    try {
      const keys = await redis.keys("vendors:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log("🗑️ Vendors cache invalidated after new application");
      }
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate vendors cache:", redisError);
    }

    // Invalidate user cache for the applicant
    try {
      await redis.del(`user:${body.userId}`);
      console.log("🗑️ User cache invalidated after vendor application");
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate user cache:", redisError);
    }

    return successResponse(
      vendor,
      "Vendor application submitted successfully",
      undefined,
      201 // Created
    );
  } catch (error) {
    console.error("Error creating vendor application:", error);

    if (error instanceof Error) {
      // Handle specific business logic errors
      if (error.message.includes("already exists")) {
        return ApiErrors.CONFLICT(error.message);
      }
      if (error.message.includes("not found")) {
        return ApiErrors.NOT_FOUND("User");
      }
      if (error.message.includes("role")) {
        return ApiErrors.FORBIDDEN(error.message);
      }
      return errorResponse(error.message, "APPLICATION_ERROR", 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to process vendor application");
  }
}
