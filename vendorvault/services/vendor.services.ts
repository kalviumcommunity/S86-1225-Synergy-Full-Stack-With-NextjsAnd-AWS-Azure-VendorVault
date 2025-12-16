import { prisma } from "@/lib/prisma";
import { Vendor, StallType } from "@prisma/client";

/**
 * VENDOR SERVICE - Transaction & Query Optimization
 *
 * Demonstrates:
 * 1. Transactional operations for data consistency
 * 2. Query optimization with selective field selection
 * 3. Pagination for large datasets
 * 4. Error handling with automatic rollback
 */

interface CreateVendorInput {
  userId: number;
  businessName: string;
  stallType: StallType;
  stationName: string;
  stallDescription?: string;
  platformNumber?: string;
  stallLocationDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * Create vendor with transaction
 *
 * Demonstrates atomicity: Vendor only created if user validation succeeds
 * Uses select to avoid over-fetching
 */
export async function createVendor(
  data: CreateVendorInput
): Promise<Partial<Vendor>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Verify user exists and has VENDOR role
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new Error(`User with ID ${data.userId} not found`);
      }

      if (user.role !== "VENDOR") {
        throw new Error("User must have VENDOR role to create vendor profile");
      }

      // Step 2: Check if vendor already exists for this user
      const existingVendor = await tx.vendor.findUnique({
        where: { userId: data.userId },
      });

      if (existingVendor) {
        throw new Error("Vendor profile already exists for this user");
      }

      // Step 3: Create vendor profile
      const vendor = await tx.vendor.create({
        data: {
          userId: data.userId,
          businessName: data.businessName,
          stallType: data.stallType,
          stationName: data.stationName,
          stallDescription: data.stallDescription,
          platformNumber: data.platformNumber,
          stallLocationDescription: data.stallLocationDescription,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        select: {
          id: true,
          userId: true,
          businessName: true,
          stallType: true,
          stationName: true,
          createdAt: true,
        },
      });

      return vendor;
    });

    console.log("✅ Vendor created successfully:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - Creating vendor:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get vendor by ID with optimized query (no over-fetching)
 */
export async function getVendorById(vendorId: number) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        userId: true,
        businessName: true,
        stallType: true,
        stationName: true,
        platformNumber: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
      },
    });

    return vendor;
  } catch (error) {
    console.error("❌ Error fetching vendor:", {
      error: error instanceof Error ? error.message : String(error),
      vendorId,
    });
    throw error;
  }
}

/**
 * Get vendors by station with pagination (optimized query)
 *
 * Demonstrates: Pagination to avoid loading large result sets
 * Uses index on stationName for fast filtering
 */
export async function getVendorsByStation(
  stationName: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const skip = (page - 1) * pageSize;

    const vendors = await prisma.vendor.findMany({
      where: { stationName },
      select: {
        id: true,
        businessName: true,
        stallType: true,
        stationName: true,
        platformNumber: true,
        createdAt: true,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.vendor.count({ where: { stationName } });

    return {
      data: vendors,
      pagination: {
        current: page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("❌ Error fetching vendors by station:", {
      error: error instanceof Error ? error.message : String(error),
      stationName,
    });
    throw error;
  }
}

/**
 * Update vendor with transaction for data consistency
 */
export async function updateVendor(
  vendorId: number,
  data: Partial<CreateVendorInput>
): Promise<Partial<Vendor>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Verify vendor exists
      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        throw new Error(`Vendor with ID ${vendorId} not found`);
      }

      // Update vendor
      const updated = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          ...(data.businessName && { businessName: data.businessName }),
          ...(data.stallType && { stallType: data.stallType }),
          ...(data.stationName && { stationName: data.stationName }),
          ...(data.platformNumber !== undefined && {
            platformNumber: data.platformNumber,
          }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.pincode !== undefined && { pincode: data.pincode }),
        },
        select: {
          id: true,
          businessName: true,
          stallType: true,
          stationName: true,
          createdAt: true,
        },
      });

      return updated;
    });

    console.log("✅ Vendor updated successfully:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - Updating vendor:", {
      error: error instanceof Error ? error.message : String(error),
      vendorId,
    });
    throw error;
  }
}

/**
 * Get vendors by stall type with pagination
 */
export async function getVendorsByStallType(
  stallType: StallType,
  page: number = 1,
  pageSize: number = 20
) {
  try {
    const skip = (page - 1) * pageSize;

    const vendors = await prisma.vendor.findMany({
      where: { stallType },
      select: {
        id: true,
        businessName: true,
        stallType: true,
        stationName: true,
        createdAt: true,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.vendor.count({ where: { stallType } });

    return {
      data: vendors,
      pagination: {
        current: page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("❌ Error fetching vendors by stall type:", {
      error: error instanceof Error ? error.message : String(error),
      stallType,
    });
    throw error;
  }
}

/**
 * Update vendor KYC details with uniqueness validation
 *
 * Demonstrates: Complex transaction with validation
 */
export async function updateVendorKYC(
  vendorId: number,
  kycData: {
    aadhaarNumber?: string;
    panNumber?: string;
    gstNumber?: string;
  }
): Promise<Partial<Vendor>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true, aadhaarNumber: true, panNumber: true },
      });

      if (!vendor) {
        throw new Error(`Vendor with ID ${vendorId} not found`);
      }

      // Validate uniqueness of aadhaar and pan if being updated
      if (
        kycData.aadhaarNumber &&
        kycData.aadhaarNumber !== vendor.aadhaarNumber
      ) {
        const existing = await tx.vendor.findUnique({
          where: { aadhaarNumber: kycData.aadhaarNumber },
        });
        if (existing) {
          throw new Error("Aadhaar number already registered");
        }
      }

      if (kycData.panNumber && kycData.panNumber !== vendor.panNumber) {
        const existing = await tx.vendor.findUnique({
          where: { panNumber: kycData.panNumber },
        });
        if (existing) {
          throw new Error("PAN number already registered");
        }
      }

      const updated = await tx.vendor.update({
        where: { id: vendorId },
        data: kycData,
        select: {
          id: true,
          businessName: true,
          aadhaarNumber: true,
          panNumber: true,
          gstNumber: true,
          updatedAt: true,
        },
      });

      return updated;
    });

    console.log("✅ KYC details updated successfully:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - Updating KYC details:", {
      error: error instanceof Error ? error.message : String(error),
      vendorId,
    });
    throw error;
  }
}

/**
 * Get all vendors with pagination and filtering
 */
export async function getAllVendors(options: {
  skip: number;
  take: number;
  filters?: {
    stationName?: string;
    stallType?: string;
    city?: string;
  };
}): Promise<{ vendors: Partial<Vendor>[]; total: number }> {
  try {
    const where: {
      stationName?: string;
      stallType?: StallType;
      city?: string;
    } = {};

    if (options.filters?.stationName) {
      where.stationName = options.filters.stationName;
    }
    if (options.filters?.stallType) {
      where.stallType = options.filters.stallType as StallType;
    }
    if (options.filters?.city) {
      where.city = options.filters.city;
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: options.skip,
        take: options.take,
        select: {
          id: true,
          businessName: true,
          stallType: true,
          stationName: true,
          platformNumber: true,
          city: true,
          state: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.vendor.count({ where }),
    ]);

    return { vendors, total };
  } catch (error) {
    console.error("❌ Error fetching vendors:", error);
    throw error;
  }
}

/**
 * Delete vendor
 */
export async function deleteVendor(vendorId: number): Promise<void> {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new Error(`Vendor with ID ${vendorId} not found`);
    }

    await prisma.vendor.delete({
      where: { id: vendorId },
    });

    console.log("✅ Vendor deleted successfully:", vendorId);
  } catch (error) {
    console.error("❌ Error deleting vendor:", {
      error: error instanceof Error ? error.message : String(error),
      vendorId,
    });
    throw error;
  }
}
