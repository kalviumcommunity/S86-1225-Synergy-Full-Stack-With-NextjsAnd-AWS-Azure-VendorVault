/**
 * @route GET /api/vendors
 * @description Get all vendors with pagination and filtering
 * @access Private (Admin/Inspector)
 */

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  ApiErrors,
  parsePaginationParams,
  calculatePagination,
} from "@/lib/api-response";
import { getAllVendors } from "@/services/vendor.services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Parse filter parameters
    const stationName = searchParams.get("stationName") || undefined;
    const stallType = searchParams.get("stallType") || undefined;
    const city = searchParams.get("city") || undefined;

    // Get vendors with pagination
    const result = await getAllVendors({
      skip,
      take: limit,
      filters: {
        stationName,
        stallType,
        city,
      },
    });

    const pagination = calculatePagination(page, limit, result.total);

    return successResponse(
      result.vendors,
      "Vendors retrieved successfully",
      pagination
    );
  } catch (error) {
    console.error("Error fetching vendors:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "FETCH_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to fetch vendors");
  }
}
