/**
 * @route GET /api/verify
 * @description Verify a license by license number or QR code
 * @access Public
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const licenseNumber = searchParams.get("licenseNumber");
    const qrCodeData = searchParams.get("qrCode");

    // Must provide at least one identifier
    if (!licenseNumber && !qrCodeData) {
      return ApiErrors.BAD_REQUEST(
        "Either licenseNumber or qrCode parameter is required"
      );
    }

    // Build where clause
    const where: {
      licenseNumber?: string;
      qrCodeData?: string;
    } = {};
    if (licenseNumber) {
      where.licenseNumber = licenseNumber;
    } else if (qrCodeData) {
      where.qrCodeData = qrCodeData;
    }

    // Find license
    const license = await prisma.license.findFirst({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            stallType: true,
            stationName: true,
            platformNumber: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!license) {
      return ApiErrors.NOT_FOUND("License");
    }

    // Check license status and expiration
    const verificationResult = {
      license,
      isValid: license.status === "APPROVED",
      isExpired: license.expiresAt
        ? new Date(license.expiresAt) < new Date()
        : false,
      message: "",
    };

    if (verificationResult.isExpired) {
      verificationResult.message = "License has expired";
      verificationResult.isValid = false;
    } else if (license.status === "PENDING") {
      verificationResult.message = "License is pending approval";
    } else if (license.status === "REJECTED") {
      verificationResult.message = "License has been rejected";
    } else if (license.status === "REVOKED") {
      verificationResult.message = "License has been revoked";
    } else if (license.status === "SUSPENDED") {
      verificationResult.message = "License is currently suspended";
    } else {
      verificationResult.message = "License is valid";
    }

    return successResponse(
      verificationResult,
      "License verification completed"
    );
  } catch (error) {
    console.error("Error verifying license:", error);

    if (error instanceof Error) {
      return errorResponse("VERIFICATION_ERROR", error.message, 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to verify license");
  }
}
