/**
 * @route POST /api/inspections
 * @description Log a new inspection/verification
 * @access Private (Inspectors)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      licenseId,
      inspectorId,
      verificationType,
      verificationStatus,
      notes,
      location,
    } = body;

    // Validate required fields
    if (!licenseId || !inspectorId) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: !licenseId ? ["licenseId"] : ["inspectorId"],
        message: "License ID and Inspector ID are required",
      });
    }

    // Verify license exists
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      select: { id: true, licenseNumber: true, status: true },
    });

    if (!license) {
      return ApiErrors.NOT_FOUND("License");
    }

    // Verify inspector exists and has correct role
    const inspector = await prisma.user.findUnique({
      where: { id: inspectorId },
      select: { id: true, role: true },
    });

    if (!inspector) {
      return ApiErrors.NOT_FOUND("Inspector");
    }

    if (inspector.role !== "INSPECTOR" && inspector.role !== "ADMIN") {
      return ApiErrors.FORBIDDEN("Only inspectors can log verifications");
    }

    // Create inspection record
    const inspection = await prisma.inspection.create({
      data: {
        licenseId,
        inspectorId,
        status: verificationStatus === "VALID" ? "COMPLIANT" : "NON_COMPLIANT",
        remarks:
          notes || `Verification of license - ${verificationType || "Manual"}`,
        inspectionLocation: location || null,
        inspectedAt: new Date(),
      },
      include: {
        license: {
          select: {
            licenseNumber: true,
            status: true,
            vendor: {
              select: {
                businessName: true,
                stationName: true,
              },
            },
          },
        },
        inspector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Invalidate inspections cache
    try {
      const keys = await redis.keys("inspections:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log("🗑️ Inspections cache invalidated");
      }
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate inspections cache:", redisError);
    }

    return successResponse(
      inspection,
      "Inspection logged successfully",
      undefined,
      201
    );
  } catch (error) {
    console.error("Error logging inspection:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "INSPECTION_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to log inspection");
  }
}

/**
 * @route GET /api/inspections
 * @description Get all inspections (with optional filters)
 * @access Private (Admin/Inspector)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inspectorId = searchParams.get("inspectorId");
    const licenseId = searchParams.get("licenseId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build cache key
    const cacheKey = `inspections:${inspectorId || "all"}:${licenseId || "all"}:${limit}`;

    // Check cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("✅ Returning cached inspections");
        return successResponse(
          JSON.parse(cached),
          "Inspections retrieved from cache"
        );
      }
    } catch (redisError) {
      console.warn("⚠️ Redis cache check failed:", redisError);
    }

    // Build where clause
    const where: {
      inspectorId?: number;
      licenseId?: number;
    } = {};

    if (inspectorId) {
      where.inspectorId = parseInt(inspectorId);
    }

    if (licenseId) {
      where.licenseId = parseInt(licenseId);
    }

    // Fetch inspections from database
    const inspections = await prisma.inspection.findMany({
      where,
      take: limit,
      orderBy: { inspectedAt: "desc" },
      include: {
        license: {
          select: {
            licenseNumber: true,
            status: true,
            vendor: {
              select: {
                businessName: true,
                stationName: true,
              },
            },
          },
        },
        inspector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Cache the result for 5 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(inspections), "EX", 300);
      console.log("✅ Inspections cached for 5 minutes");
    } catch (redisError) {
      console.warn("⚠️ Failed to cache inspections:", redisError);
    }

    return successResponse(
      inspections,
      `Retrieved ${inspections.length} inspection(s)`
    );
  } catch (error) {
    console.error("Error fetching inspections:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "FETCH_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to fetch inspections");
  }
}
