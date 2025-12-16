/**
 * @route GET /api/vendors/[id]
 * @route PUT /api/vendors/[id]
 * @route DELETE /api/vendors/[id]
 * @description Vendor operations by ID
 * @access Private
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import {
  getVendorById,
  updateVendor,
  deleteVendor,
} from "@/services/vendor.services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/vendors/[id] - Get vendor by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const vendorId = Number(id);

    if (isNaN(vendorId)) {
      return ApiErrors.BAD_REQUEST("Invalid vendor ID");
    }

    const vendor = await getVendorById(vendorId);

    if (!vendor) {
      return ApiErrors.NOT_FOUND("Vendor");
    }

    return successResponse(vendor, "Vendor retrieved successfully");
  } catch (error) {
    console.error("Error fetching vendor:", error);

    if (error instanceof Error) {
      return errorResponse("FETCH_ERROR", error.message, 500);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to fetch vendor");
  }
}

/**
 * PUT /api/vendors/[id] - Update vendor by ID
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const vendorId = Number(id);

    if (isNaN(vendorId)) {
      return ApiErrors.BAD_REQUEST("Invalid vendor ID");
    }

    const body = await request.json();

    // Update vendor
    const vendor = await updateVendor(vendorId, body);

    return successResponse(vendor, "Vendor updated successfully");
  } catch (error) {
    console.error("Error updating vendor:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return ApiErrors.NOT_FOUND("Vendor");
      }
      return errorResponse("UPDATE_ERROR", error.message, 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to update vendor");
  }
}

/**
 * DELETE /api/vendors/[id] - Delete vendor by ID
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const vendorId = Number(id);

    if (isNaN(vendorId)) {
      return ApiErrors.BAD_REQUEST("Invalid vendor ID");
    }

    await deleteVendor(vendorId);

    return successResponse(null, "Vendor deleted successfully", undefined, 204);
  } catch (error) {
    console.error("Error deleting vendor:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return ApiErrors.NOT_FOUND("Vendor");
      }
      return errorResponse("DELETE_ERROR", error.message, 400);
    }

    return ApiErrors.INTERNAL_ERROR("Failed to delete vendor");
  }
}
