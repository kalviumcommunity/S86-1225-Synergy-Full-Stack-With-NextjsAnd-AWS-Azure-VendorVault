import { prisma } from "@/lib/prisma";
import { License, LicenseStatus } from "@prisma/client";

/**
 * LICENSE SERVICE - Transaction & Query Optimization
 *
 * Demonstrates:
 * 1. Complex transactional workflows (approval, rejection, renewal)
 * 2. Query optimization with selective field selection
 * 3. Error handling with automatic rollback
 */

interface CreateLicenseInput {
  vendorId: number;
  licenseNumber: string;
  isRenewal?: boolean;
  previousLicenseId?: number;
}

interface ApproveLicenseInput {
  licenseId: number;
  approvedById: number;
  expiresAt: Date;
}

interface RejectLicenseInput {
  licenseId: number;
  rejectionReason: string;
}

/**
 * Create license with transaction and validation
 */
export async function createLicense(
  data: CreateLicenseInput
): Promise<Partial<License>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Verify vendor exists
      const vendor = await tx.vendor.findUnique({
        where: { id: data.vendorId },
        select: { id: true },
      });

      if (!vendor) {
        throw new Error(`Vendor with ID ${data.vendorId} not found`);
      }

      // Step 2: Check if license number is unique
      const existingLicense = await tx.license.findUnique({
        where: { licenseNumber: data.licenseNumber },
      });

      if (existingLicense) {
        throw new Error(`License number ${data.licenseNumber} already exists`);
      }

      // Step 3: Create license
      const license = await tx.license.create({
        data: {
          vendorId: data.vendorId,
          licenseNumber: data.licenseNumber,
          status: "PENDING",
          isRenewal: data.isRenewal || false,
          previousLicenseId: data.previousLicenseId,
        },
        select: {
          id: true,
          licenseNumber: true,
          vendorId: true,
          status: true,
          createdAt: true,
        },
      });

      return license;
    });

    console.log("✅ License created successfully:", result.licenseNumber);
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - Creating license:", {
      error: error instanceof Error ? error.message : String(error),
      licenseNumber: data.licenseNumber,
    });
    throw error;
  }
}

/**
 * Approve license - Complex transaction with multiple steps
 *
 * Demonstrates: Atomic workflow where all steps must succeed together
 */
export async function approveLicense(
  data: ApproveLicenseInput
): Promise<Partial<License>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Fetch and validate license
      const license = await tx.license.findUnique({
        where: { id: data.licenseId },
        select: {
          id: true,
          licenseNumber: true,
          vendorId: true,
          status: true,
          vendor: {
            select: { id: true },
          },
        },
      });

      if (!license) {
        throw new Error(`License with ID ${data.licenseId} not found`);
      }

      if (license.status !== "PENDING") {
        throw new Error(
          `Cannot approve license with status ${license.status}. Only PENDING licenses can be approved.`
        );
      }

      // Step 2: Verify approver is admin or inspector
      const approver = await tx.user.findUnique({
        where: { id: data.approvedById },
        select: { id: true, role: true },
      });

      if (!approver) {
        throw new Error(`Approver with ID ${data.approvedById} not found`);
      }

      if (!["ADMIN", "INSPECTOR"].includes(approver.role)) {
        throw new Error("Only ADMIN or INSPECTOR can approve licenses");
      }

      // Step 3: Update license status
      const updatedLicense = await tx.license.update({
        where: { id: data.licenseId },
        data: {
          status: "APPROVED",
          approvedById: data.approvedById,
          approvedAt: new Date(),
          issuedAt: new Date(),
          expiresAt: data.expiresAt,
        },
        select: {
          id: true,
          licenseNumber: true,
          vendorId: true,
          status: true,
          expiresAt: true,
        },
      });

      // Step 4: Create notification record
      await tx.notification.create({
        data: {
          userId: license.vendor.id,
          type: "APPLICATION_APPROVED",
          channel: "EMAIL",
          title: "License Approved",
          message: `Your license ${license.licenseNumber} has been approved.`,
          licenseId: data.licenseId,
          isSent: false,
        },
      });

      return updatedLicense;
    });

    console.log("✅ License approved successfully:", result.licenseNumber);
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - Approving license:", {
      error: error instanceof Error ? error.message : String(error),
      licenseId: data.licenseId,
    });
    throw error;
  }
}

/**
 * Reject license - Transactional workflow
 */
export async function rejectLicense(
  data: RejectLicenseInput
): Promise<Partial<License>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Fetch license
      const license = await tx.license.findUnique({
        where: { id: data.licenseId },
        select: {
          id: true,
          licenseNumber: true,
          status: true,
          vendor: {
            select: { id: true },
          },
        },
      });

      if (!license) {
        throw new Error(`License with ID ${data.licenseId} not found`);
      }

      if (license.status !== "PENDING") {
        throw new Error(
          `Cannot reject license with status ${license.status}. Only PENDING licenses can be rejected.`
        );
      }

      // Step 2: Update license status
      const updated = await tx.license.update({
        where: { id: data.licenseId },
        data: {
          status: "REJECTED",
          rejectionReason: data.rejectionReason,
        },
        select: {
          id: true,
          licenseNumber: true,
          status: true,
          rejectionReason: true,
        },
      });

      // Step 3: Create notification
      await tx.notification.create({
        data: {
          userId: license.vendor.id,
          type: "APPLICATION_REJECTED",
          channel: "EMAIL",
          title: "Application Rejected",
          message: `Your license application ${license.licenseNumber} has been rejected.`,
          licenseId: data.licenseId,
          isSent: false,
        },
      });

      return updated;
    });

    console.log("✅ License rejected successfully:", result.licenseNumber);
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - Rejecting license:", {
      error: error instanceof Error ? error.message : String(error),
      licenseId: data.licenseId,
    });
    throw error;
  }
}

/**
 * Get license with details (optimized query)
 */
export async function getLicenseById(licenseId: number) {
  try {
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      select: {
        id: true,
        licenseNumber: true,
        vendorId: true,
        status: true,
        approvedAt: true,
        expiresAt: true,
        rejectionReason: true,
        createdAt: true,
        vendor: {
          select: {
            businessName: true,
            stationName: true,
          },
        },
      },
    });

    return license;
  } catch (error) {
    console.error("❌ Error fetching license:", {
      error: error instanceof Error ? error.message : String(error),
      licenseId,
    });
    throw error;
  }
}

/**
 * Get licenses by status with pagination (optimized query)
 */
export async function getLicensesByStatus(
  status: LicenseStatus,
  page: number = 1,
  pageSize: number = 20
) {
  try {
    const skip = (page - 1) * pageSize;

    const licenses = await prisma.license.findMany({
      where: { status },
      select: {
        id: true,
        licenseNumber: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        vendor: {
          select: {
            businessName: true,
            stationName: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.license.count({ where: { status } });

    return {
      data: licenses,
      pagination: {
        current: page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("❌ Error fetching licenses by status:", {
      error: error instanceof Error ? error.message : String(error),
      status,
    });
    throw error;
  }
}

/**
 * Get expiring licenses (within 30 days)
 */
export async function getExpiringLicenses(daysThreshold: number = 30) {
  try {
    const now = new Date();
    const expiryDate = new Date(
      now.getTime() + daysThreshold * 24 * 60 * 60 * 1000
    );

    const licenses = await prisma.license.findMany({
      where: {
        status: "APPROVED",
        expiresAt: {
          lte: expiryDate,
          gte: now,
        },
      },
      select: {
        id: true,
        licenseNumber: true,
        expiresAt: true,
        vendor: {
          select: {
            businessName: true,
          },
        },
      },
      orderBy: { expiresAt: "asc" },
    });

    return licenses;
  } catch (error) {
    console.error("❌ Error fetching expiring licenses:", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Renew license - Complex transaction
 *
 * Demonstrates: Multi-step transaction with validation and atomic updates
 */
export async function renewLicense(
  oldLicenseId: number,
  newLicenseNumber: string,
  expiresAt: Date
): Promise<{ oldLicense: Partial<License>; newLicense: Partial<License> }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Fetch old license
      const oldLicense = await tx.license.findUnique({
        where: { id: oldLicenseId },
        select: {
          id: true,
          licenseNumber: true,
          vendorId: true,
          status: true,
        },
      });

      if (!oldLicense) {
        throw new Error(`License with ID ${oldLicenseId} not found`);
      }

      if (!["APPROVED", "EXPIRED"].includes(oldLicense.status)) {
        throw new Error(
          `Cannot renew license with status ${oldLicense.status}.`
        );
      }

      // Step 2: Create new license
      const newLicense = await tx.license.create({
        data: {
          vendorId: oldLicense.vendorId,
          licenseNumber: newLicenseNumber,
          status: "PENDING",
          isRenewal: true,
          previousLicenseId: oldLicenseId,
          expiresAt,
        },
        select: {
          id: true,
          licenseNumber: true,
          vendorId: true,
          status: true,
          createdAt: true,
        },
      });

      // Step 3: Mark old license as EXPIRED if not already
      if (oldLicense.status !== "EXPIRED") {
        await tx.license.update({
          where: { id: oldLicenseId },
          data: { status: "EXPIRED" },
        });
      }

      return { oldLicense, newLicense };
    });

    console.log(
      "✅ License renewed successfully:",
      result.newLicense.licenseNumber
    );
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - Renewing license:", {
      error: error instanceof Error ? error.message : String(error),
      oldLicenseId,
    });
    throw error;
  }
}

/**
 * Get licenses by vendor with pagination
 */
export async function getLicensesByVendor(
  vendorId: number,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const skip = (page - 1) * pageSize;

    const licenses = await prisma.license.findMany({
      where: { vendorId },
      select: {
        id: true,
        licenseNumber: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.license.count({ where: { vendorId } });

    return {
      data: licenses,
      pagination: {
        current: page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("❌ Error fetching vendor licenses:", {
      error: error instanceof Error ? error.message : String(error),
      vendorId,
    });
    throw error;
  }
}
