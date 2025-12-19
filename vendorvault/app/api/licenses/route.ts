/**
 * @route GET /api/licenses
 * @route POST /api/licenses
 * @description License management endpoints
 * @access Private
 */

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  ApiErrors,
  parsePaginationParams,
  calculatePagination,
} from "@/lib/api-response";
import { licenseCreateSchema } from "@/lib/schemas/licenseSchema";
import { validateRequestData } from "@/lib/validation";
import { createLicense } from "@/services/license.service";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

/**
 * GET /api/licenses - Get all licenses with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Parse filter parameters
    const status = searchParams.get("status") || undefined;
    const vendorId = searchParams.get("vendorId")
      ? Number(searchParams.get("vendorId"))
      : undefined;
    const licenseNumber = searchParams.get("licenseNumber") || undefined;

    // Build where clause
    const where: {
      status?:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED"
        | "REVOKED"
        | "SUSPENDED";
      vendorId?: number;
      licenseNumber?: { contains: string; mode: "insensitive" };
    } = {};
    if (status)
      where.status = status as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED"
        | "REVOKED"
        | "SUSPENDED";
    if (vendorId) where.vendorId = vendorId;
    if (licenseNumber)
      where.licenseNumber = { contains: licenseNumber, mode: "insensitive" };

    // Generate cache key based on query parameters
    const cacheKey = `licenses:page:${page}:limit:${limit}:status:${status || "all"}:vendor:${vendorId || "all"}:number:${licenseNumber || "all"}`;

    // Check Redis cache first
    try {
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        console.log("✅ Cache Hit - Licenses data served from Redis");
        const parsedData = JSON.parse(cachedData);
        return successResponse(
          parsedData.licenses,
          "Licenses retrieved successfully (cached)",
          parsedData.pagination
        );
      }
    } catch (redisError) {
      console.warn(
        "⚠️ Redis cache read failed, falling back to database:",
        redisError
      );
    }

    console.log("❌ Cache Miss - Fetching licenses data from database");

    // Get total count
    const total = await prisma.license.count({ where });

    // Get licenses with pagination
    const licenses = await prisma.license.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        licenseNumber: true,
        status: true,
        vendorId: true,
        approvedAt: true,
        expiresAt: true,
        createdAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            stallType: true,
            stationName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pagination = calculatePagination(page, limit, total);

    // Cache the response for 120 seconds (2 minutes)
    try {
      await redis.set(
        cacheKey,
        JSON.stringify({ licenses, pagination }),
        "EX",
        120
      );
      console.log("💾 Licenses data cached successfully");
    } catch (redisError) {
      console.warn("⚠️ Failed to cache licenses data:", redisError);
    }

    return successResponse(
      licenses,
      "Licenses retrieved successfully",
      pagination
    );
  } catch (error) {
    console.error("Error fetching licenses:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "FETCH_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to fetch licenses");
  }
}

/**
 * POST /api/licenses - Create a new license
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod
    const validation = await validateRequestData(request, licenseCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;

    // Create license
    const license = await createLicense({
      vendorId: body.vendorId,
      licenseNumber: body.licenseNumber,
      isRenewal: body.isRenewal || false,
      previousLicenseId: body.previousLicenseId,
    });

    // Invalidate licenses cache after creation
    try {
      const keys = await redis.keys("licenses:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log("🗑️ Licenses cache invalidated after creation");
      }
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate licenses cache:", redisError);
    }

    return successResponse(
      license,
      "License created successfully",
      undefined,
      201 // Created
    );
  } catch (error) {
    console.error("Error creating license:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return ApiErrors.CONFLICT(error.message);
      }
      if (error.message.includes("not found")) {
        return ApiErrors.NOT_FOUND("Vendor");
      }
      return errorResponse(error.message, "CREATION_ERROR", 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to create license");
  }
}
