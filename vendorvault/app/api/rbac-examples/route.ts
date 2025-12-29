/**
 * @route /api/rbac-examples - RBAC Implementation Examples
 * @description Demonstrates various RBAC patterns and permission checks
 * @access Mixed (different endpoints require different permissions)
 */

import { NextRequest, NextResponse } from "next/server";
import { Role, Permission } from "@/config/roles";
import {
  requireRole,
  withRBAC,
  withPermission,
  checkPermission,
  getAuthenticatedUser,
} from "@/lib/rbac";
import { successResponse, ApiErrors } from "@/lib/api-response";

/**
 * Example 1: Using withRBAC wrapper for role-based access
 * Only ADMIN users can access this endpoint
 */
export const GET = withRBAC([Role.ADMIN], async (_request, { user }) => {
  return successResponse(
    {
      message: "This endpoint is accessible only to ADMIN users",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      example: "Using withRBAC wrapper",
    },
    "Admin access granted"
  );
});

/**
 * Example 2: Using withPermission wrapper for permission-based access
 * Users with CREATE_USER permission can access this endpoint
 */
export const POST = withPermission(
  Permission.CREATE_USER,
  async (request, { user }) => {
    const body = await request.json();

    return successResponse(
      {
        message: "This endpoint requires CREATE_USER permission",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        body,
        example: "Using withPermission wrapper",
      },
      "Permission check passed"
    );
  }
);

/**
 * Example 3: Manual permission check with conditional logic
 * Different behavior based on user role
 */
export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      ApiErrors.UNAUTHORIZED("Authentication required"),
      { status: 401 }
    );
  }

  const body = await request.json();
  const { targetUserId } = body;

  // Check if user can update the target user
  const canUpdate = checkPermission(user, Permission.UPDATE_USER, targetUserId);

  if (!canUpdate.allowed) {
    return NextResponse.json(
      ApiErrors.FORBIDDEN(canUpdate.reason || "Access denied"),
      { status: 403 }
    );
  }

  // Different behavior based on role
  let responseData;
  if (user.role === Role.ADMIN) {
    responseData = {
      message: "Admin can update any user",
      targetUserId,
    };
  } else if (user.role === Role.VENDOR) {
    responseData = {
      message: "Vendor can only update their own profile",
      targetUserId,
    };
  } else {
    responseData = {
      message: "Update operation",
      targetUserId,
    };
  }

  return successResponse(
    {
      ...responseData,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      example: "Manual permission check with conditional logic",
    },
    "Update successful"
  );
}

/**
 * Example 4: Multiple role access
 * Both ADMIN and INSPECTOR can access this endpoint
 */
export async function PATCH(request: NextRequest) {
  const { response, user } = await requireRole(request, [
    Role.ADMIN,
    Role.INSPECTOR,
  ]);

  if (response) {
    return response;
  }

  return successResponse(
    {
      message: "This endpoint is accessible to ADMIN and INSPECTOR roles",
      user: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
      },
      example: "Multiple role access",
    },
    "Access granted to authorized roles"
  );
}
