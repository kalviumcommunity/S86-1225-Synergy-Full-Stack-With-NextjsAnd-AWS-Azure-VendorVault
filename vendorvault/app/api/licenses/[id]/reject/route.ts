/**
 * @route POST /api/licenses/[id]/reject
 * @description Reject a license application with email notification
 * @access Private (Admin only)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { rejectLicense } from "@/services/license.service";
import redis from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email.service";
import { licenseRejectionTemplate } from "@/lib/email-templates";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const licenseId = Number(id);

    if (isNaN(licenseId)) {
      return ApiErrors.BAD_REQUEST("Invalid license ID");
    }

    const body = await request.json();

    // Validate required fields
    if (!body.rejectionReason) {
      return ApiErrors.VALIDATION_ERROR({
        missingFields: ["rejectionReason"],
        message: "Rejection reason is required",
      });
    }

    // Reject license
    const license = await rejectLicense({
      licenseId,
      rejectionReason: body.rejectionReason,
    });

    // Send rejection email notification
    try {
      // Get vendor email
      const fullLicense = await prisma.license.findUnique({
        where: { id: licenseId },
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
        const emailTemplate = licenseRejectionTemplate(
          fullLicense.vendor.user.name,
          fullLicense.licenseNumber,
          body.rejectionReason
        );

        await sendEmail({
          to: fullLicense.vendor.user.email,
          subject: "License Application Update - VendorVault",
          html: emailTemplate,
        });
        console.log(
          "✅ Rejection email sent to:",
          fullLicense.vendor.user.email
        );
      }
    } catch (emailError) {
      console.error("⚠️ Email notification failed:", emailError);
      // Don't fail the entire rejection if email fails
    }

    // Invalidate licenses cache after rejection
    try {
      const keys = await redis.keys("licenses:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log("🗑️ Licenses cache invalidated after rejection");
      }
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate licenses cache:", redisError);
    }

    return successResponse(
      license,
      "License rejected successfully. Notification email sent."
    );
  } catch (error) {
    console.error("Error rejecting license:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return ApiErrors.NOT_FOUND("License");
      }
      return errorResponse(error.message, "REJECTION_ERROR", 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to reject license");
  }
}
