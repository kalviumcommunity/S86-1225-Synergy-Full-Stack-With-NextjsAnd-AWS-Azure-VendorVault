/**
 * @route POST /api/vendor/apply
 * @description Create a new vendor application
 * @access Private (Authenticated Vendors)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { createVendor } from "@/services/vendor.services";
import { StallType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "userId",
      "businessName",
      "stallType",
      "stationName",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate stallType enum
    if (!Object.values(StallType).includes(body.stallType)) {
      return ApiErrors.BAD_REQUEST(
        `Invalid stall type. Must be one of: ${Object.values(StallType).join(", ")}`
      );
    }

    // Create vendor application
    const vendor = await createVendor({
      userId: Number(body.userId),
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
      return errorResponse("APPLICATION_ERROR", error.message, 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to process vendor application");
  }
}
