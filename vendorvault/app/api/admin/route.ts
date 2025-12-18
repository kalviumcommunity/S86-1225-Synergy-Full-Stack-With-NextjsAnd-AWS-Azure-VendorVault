/**
 * @route GET /api/admin - Admin-only route for system management
 * @description Protected route accessible only to users with ADMIN role
 * @access Private (ADMIN only)
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin - Admin dashboard data and system statistics
 *
 * @headers {string} authorization - Bearer token (JWT)
 * @headers {string} x-user-id - User ID (set by middleware)
 * @headers {string} x-user-email - User email (set by middleware)
 * @headers {string} x-user-role - User role (set by middleware)
 *
 * @returns {object} - Success response with admin dashboard data
 */
export async function GET(request: NextRequest) {
  // User info is already validated by middleware
  // We can safely access it from headers
  const userRole = request.headers.get("x-user-role");
  const userEmail = request.headers.get("x-user-email");

  // Fetch admin dashboard statistics
  const stats = await prisma.$transaction(async (tx) => {
    const [
      totalUsers,
      totalVendors,
      totalLicenses,
      pendingLicenses,
      approvedLicenses,
      expiredLicenses,
    ] = await Promise.all([
      tx.user.count(),
      tx.vendor.count(),
      tx.license.count(),
      tx.license.count({ where: { status: "PENDING" } }),
      tx.license.count({ where: { status: "APPROVED" } }),
      tx.license.count({ where: { status: "EXPIRED" } }),
    ]);

    return {
      users: {
        total: totalUsers,
      },
      vendors: {
        total: totalVendors,
      },
      licenses: {
        total: totalLicenses,
        pending: pendingLicenses,
        approved: approvedLicenses,
        expired: expiredLicenses,
      },
    };
  });

  return successResponse(
    {
      message: "Welcome Admin! You have full access to the system.",
      role: userRole,
      email: userEmail,
      stats,
    },
    "Admin dashboard data retrieved successfully"
  );
}

/**
 * POST /api/admin - Admin action (example: system configuration)
 *
 * @headers {string} authorization - Bearer token (JWT)
 * @body {object} action - Admin action to perform
 *
 * @returns {object} - Success response
 */
export async function POST(request: NextRequest) {
  const userRole = request.headers.get("x-user-role");
  const userEmail = request.headers.get("x-user-email");

  const body = await request.json();

  return successResponse(
    {
      message: "Admin action executed successfully",
      role: userRole,
      email: userEmail,
      action: body,
    },
    "Admin action completed"
  );
}
