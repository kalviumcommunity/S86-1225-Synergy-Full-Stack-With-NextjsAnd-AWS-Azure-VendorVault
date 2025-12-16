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
import { createLicense } from "@/services/license.service";
import { prisma } from "@/lib/prisma";

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

    return successResponse(
      licenses,
      "Licenses retrieved successfully",
      pagination
    );
  } catch (error) {
    console.error("Error fetching licenses:", error);

    if (error instanceof Error) {
      return errorResponse("FETCH_ERROR", error.message, 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to fetch licenses");
  }
}

/**
 * POST /api/licenses - Create a new license
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["vendorId", "licenseNumber"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Create license
    const license = await createLicense({
      vendorId: Number(body.vendorId),
      licenseNumber: body.licenseNumber,
      isRenewal: body.isRenewal || false,
      previousLicenseId: body.previousLicenseId
        ? Number(body.previousLicenseId)
        : undefined,
    });

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
      return errorResponse("CREATION_ERROR", error.message, 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to create license");
  }
}
