/**
 * @route POST /api/license/approve
 * @description Approve a license application with QR code generation and email notification
 * @access Private (Admin only)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { approveLicense } from "@/services/license.service";
import { licenseApproveSchema } from "@/lib/schemas/licenseSchema";
import type { LicenseApproveInput } from "@/lib/schemas/licenseSchema";
import { validateRequestData } from "@/lib/validation";
import redis from "@/lib/redis";
import { generateQRCode } from "@/lib/qr";
import { sendLicenseApprovalEmail } from "@/services/email.service";
import { licenseApprovalTemplate } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod
    const validation = await validateRequestData(request, licenseApproveSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data as LicenseApproveInput;

    // Approve license
    const license = await approveLicense({
      licenseId: request.nextUrl.searchParams.get("licenseId")
        ? Number(request.nextUrl.searchParams.get("licenseId"))
        : 0,
      approvedById: body.approvedById,
      expiresAt: new Date(body.expiresAt),
    });

    // Generate QR code for the approved license
    let qrCodeUrl = "";
    try {
      qrCodeUrl = license.licenseNumber
        ? await generateQRCode(license.licenseNumber)
        : "";
      console.log("✅ QR Code generated:", qrCodeUrl);
    } catch (qrError) {
      console.error("⚠️ QR code generation failed:", qrError);
      // Don't fail the entire approval if QR generation fails
    }

    // Send approval email notification
    try {
      // Get vendor email
      const fullLicense = await prisma.license.findUnique({
        where: { id: license.id },
        include: {
          vendor: {
            include: {
              user: {
                select: { email: true, name: true },
              },
            },
          },
        },
      });

      if (fullLicense?.vendor?.user?.email) {
        const emailTemplate = licenseApprovalTemplate(
          fullLicense.vendor.user.name,
          license.licenseNumber ?? "",
          qrCodeUrl,
          license.expiresAt?.toLocaleDateString() || "N/A"
        );

        await sendLicenseApprovalEmail(
          fullLicense.vendor.user.email,
          emailTemplate
        );
        console.log(
          "✅ Approval email sent to:",
          fullLicense.vendor.user.email
        );
      }
    } catch (emailError) {
      console.error("⚠️ Email notification failed:", emailError);
      // Don't fail the entire approval if email fails
    }

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

    return successResponse(
      { ...license, qrCodeUrl },
      "License approved successfully. QR code generated and email sent."
    );
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
