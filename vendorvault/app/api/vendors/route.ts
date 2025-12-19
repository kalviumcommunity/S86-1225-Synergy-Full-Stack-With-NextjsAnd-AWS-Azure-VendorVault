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
import redis from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Parse filter parameters
    const stationName = searchParams.get("stationName") || undefined;
    const stallType = searchParams.get("stallType") || undefined;
    const city = searchParams.get("city") || undefined;

    // Generate cache key based on query parameters
    const cacheKey = `vendors:page:${page}:limit:${limit}:station:${stationName || "all"}:type:${stallType || "all"}:city:${city || "all"}`;

    // Check Redis cache first
    try {
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        console.log("✅ Cache Hit - Vendors data served from Redis");
        const parsedData = JSON.parse(cachedData);
        return successResponse(
          parsedData.vendors,
          "Vendors retrieved successfully (cached)",
          parsedData.pagination
        );
      }
    } catch (redisError) {
      console.warn(
        "⚠️ Redis cache read failed, falling back to database:",
        redisError
      );
    }

    console.log("❌ Cache Miss - Fetching vendors data from database");

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

    // Cache the response for 180 seconds (3 minutes)
    try {
      await redis.set(
        cacheKey,
        JSON.stringify({ vendors: result.vendors, pagination }),
        "EX",
        180
      );
      console.log("💾 Vendors data cached successfully");
    } catch (redisError) {
      console.warn("⚠️ Failed to cache vendors data:", redisError);
    }

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
