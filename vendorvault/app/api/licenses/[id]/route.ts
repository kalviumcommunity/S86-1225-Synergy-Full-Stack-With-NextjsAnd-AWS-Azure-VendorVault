/**
 * @route GET /api/licenses/[id]
 * @route PUT /api/licenses/[id]
 * @route DELETE /api/licenses/[id]
 * @description License operations by ID
 * @access Private
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { licenseUpdateSchema } from "@/lib/schemas/licenseSchema";
import { validateRequestData } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/licenses/[id] - Get license by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const licenseId = Number(id);

    if (isNaN(licenseId)) {
      return ApiErrors.BAD_REQUEST("Invalid license ID");
    }

    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            stallType: true,
            stationName: true,
            address: true,
            city: true,
            state: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!license) {
      return ApiErrors.NOT_FOUND("License");
    }

    return successResponse(license, "License retrieved successfully");
  } catch (error) {
    console.error("Error fetching license:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "FETCH_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to fetch license");
  }
}

/**
 * PUT /api/licenses/[id] - Update license by ID
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const licenseId = Number(id);

    if (isNaN(licenseId)) {
      return ApiErrors.BAD_REQUEST("Invalid license ID");
    }

    // Validate request data with Zod
    const validation = await validateRequestData(request, licenseUpdateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;

    // Check if license exists
    const existingLicense = await prisma.license.findUnique({
      where: { id: licenseId },
    });

    if (!existingLicense) {
      return ApiErrors.NOT_FOUND("License");
    }

    // Update license
    const license = await prisma.license.update({
      where: { id: licenseId },
      data: {
        ...(body.expiresAt && { expiresAt: new Date(body.expiresAt) }),
        ...(body.notes && { remarks: body.notes }),
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            stationName: true,
          },
        },
      },
    });

    return successResponse(license, "License updated successfully");
  } catch (error) {
    console.error("Error updating license:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "UPDATE_ERROR", 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to update license");
  }
}

/**
 * DELETE /api/licenses/[id] - Delete license by ID
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const licenseId = Number(id);

    if (isNaN(licenseId)) {
      return ApiErrors.BAD_REQUEST("Invalid license ID");
    }

    // Check if license exists
    const existingLicense = await prisma.license.findUnique({
      where: { id: licenseId },
    });

    if (!existingLicense) {
      return ApiErrors.NOT_FOUND("License");
    }

    // Delete license
    await prisma.license.delete({
      where: { id: licenseId },
    });

    return successResponse(
      null,
      "License deleted successfully",
      undefined,
      204
    );
  } catch (error) {
    console.error("Error deleting license:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "DELETE_ERROR", 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to delete license");
  }
}
