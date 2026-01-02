/**
 * @route POST /api/vendor/apply
 * @description Create a new vendor application
 * @access Private (Authenticated Vendors)
 */

import { NextRequest } from "next/server";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { createVendor } from "@/services/vendor.services";
import {
  vendorApplySchema,
  type VendorApplyInput,
} from "@/lib/schemas/vendorSchema";
import { validateRequestData } from "@/lib/validation";
import redis from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod
    const validation = await validateRequestData<VendorApplyInput>(
      request,
      vendorApplySchema
    );
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;

    // Create vendor application with all comprehensive data
    const vendor = await createVendor({
      userId: body.userId,

      // Personal Information
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      alternatePhone: body.alternatePhone,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      aadharNumber: body.aadharNumber,

      // Business Information
      businessName: body.businessName,
      businessType: body.businessType,
      businessAddress: body.businessAddress,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      gstNumber: body.gstNumber,
      panNumber: body.panNumber,
      yearsInBusiness: body.yearsInBusiness,

      // Railway Station Information
      preferredStation: body.preferredStation,
      stationType: body.stationType,
      shopNumber: body.shopNumber,
      platformNumber: body.platformNumber,
      shopArea: body.shopArea,

      // Product/Service Information
      productCategory: body.productCategory,
      productDescription: body.productDescription,
      estimatedDailySales: body.estimatedDailySales,
      operatingHours: body.operatingHours,

      // Document URLs
      aadharUrl: body.aadharUrl,
      panUrl: body.panUrl,
      gstUrl: body.gstUrl,
      businessProofUrl: body.businessProofUrl,
      photoUrl: body.photoUrl,
      shopPhotosUrl: body.shopPhotosUrl,

      // Bank Information
      bankName: body.bankName,
      accountNumber: body.accountNumber,
      ifscCode: body.ifscCode,
      accountHolderName: body.accountHolderName,
      branchName: body.branchName,

      // Declarations
      agreeToTerms: body.agreeToTerms,
      declarationAccurate: body.declarationAccurate,
    });

    // Invalidate vendors cache after new application
    try {
      const keys = await redis.keys("vendors:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log("🗑️ Vendors cache invalidated after new application");
      }
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate vendors cache:", redisError);
    }

    // Invalidate user cache for the applicant
    try {
      await redis.del(`user:${body.userId}`);
      console.log("🗑️ User cache invalidated after vendor application");
    } catch (redisError) {
      console.warn("⚠️ Failed to invalidate user cache:", redisError);
    }

    // Send application confirmation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: body.userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        const { sendVendorApplicationEmail } =
          await import("@/services/email.service");
        const { vendorApplicationTemplate } =
          await import("@/lib/email-templates");

        const emailTemplate = vendorApplicationTemplate(
          user.name,
          "pending",
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/vendor/dashboard`
        );

        await sendVendorApplicationEmail(user.email, emailTemplate);
        console.log("✅ Application confirmation email sent to:", user.email);
      }
    } catch (emailError) {
      console.error("⚠️ Email notification failed:", emailError);
      // Don't fail the application if email fails
    }

    return successResponse(
      vendor,
      "Vendor application submitted successfully! Our team will review it shortly.",
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
      return ApiErrors.BAD_REQUEST(error.message);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to process vendor application");
  }
}
