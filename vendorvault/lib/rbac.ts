/**
 * RBAC Utility Functions
 * Implements role-based access control checks and enforcement
 */

import { NextRequest, NextResponse } from "next/server";
import { JWTPayload, requireAuth } from "./auth";
import {
  Role,
  Permission,
  hasPermission,
  canAccessResource,
} from "@/config/roles";
import { ApiErrors } from "./api-response";
import { logAccess, AccessDecision } from "./audit-logger";
import { getClientIP } from "./security";

/**
 * Interface for authenticated request with user context
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Result of RBAC check
 */
export interface RBACResult {
  allowed: boolean;
  reason?: string;
  user?: JWTPayload;
}

/**
 * Middleware to require specific permission
 * Returns error response if user lacks permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission,
  resourceOwnerId?: number
): Promise<{ response?: NextResponse; user?: JWTPayload }> {
  // First check authentication
  const authResult = await requireAuth(request);

  if (authResult.error || !authResult.user) {
    logAccess({
      userId: null,
      role: null,
      action: permission,
      resource: request.nextUrl.pathname,
      decision: AccessDecision.DENIED,
      reason: "Not authenticated",
      timestamp: new Date(),
      ipAddress: getClientIP(request),
    });

    return {
      response: NextResponse.json(authResult.error, { status: 401 }),
    };
  }

  const user = authResult.user;
  const userRole = user.role as Role;

  // Check if user has the required permission
  if (!hasPermission(userRole, permission)) {
    logAccess({
      userId: user.id,
      role: userRole,
      action: permission,
      resource: request.nextUrl.pathname,
      decision: AccessDecision.DENIED,
      reason: `Role ${userRole} lacks permission ${permission}`,
      timestamp: new Date(),
      ipAddress: getClientIP(request),
    });

    return {
      response: NextResponse.json(
        ApiErrors.FORBIDDEN(
          `Access denied: insufficient permissions. Required: ${permission}`
        ),
        { status: 403 }
      ),
    };
  }

  // Check resource ownership if applicable
  if (resourceOwnerId !== undefined) {
    if (!canAccessResource(userRole, user.id, resourceOwnerId)) {
      logAccess({
        userId: user.id,
        role: userRole,
        action: permission,
        resource: request.nextUrl.pathname,
        decision: AccessDecision.DENIED,
        reason: `User ${user.id} cannot access resource owned by ${resourceOwnerId}`,
        timestamp: new Date(),
        ipAddress: getClientIP(request),
      });

      return {
        response: NextResponse.json(
          ApiErrors.FORBIDDEN(
            "Access denied: you can only access your own resources"
          ),
          { status: 403 }
        ),
      };
    }
  }

  // Access granted
  logAccess({
    userId: user.id,
    role: userRole,
    action: permission,
    resource: request.nextUrl.pathname,
    decision: AccessDecision.ALLOWED,
    timestamp: new Date(),
    ipAddress: getClientIP(request),
  });

  return { user };
}

/**
 * Middleware to require specific role(s)
 * Returns error response if user doesn't have required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: Role[]
): Promise<{ response?: NextResponse; user?: JWTPayload }> {
  // First check authentication
  const authResult = await requireAuth(request);

  if (authResult.error || !authResult.user) {
    logAccess({
      userId: null,
      role: null,
      action: "access",
      resource: request.nextUrl.pathname,
      decision: AccessDecision.DENIED,
      reason: "Not authenticated",
      timestamp: new Date(),
      ipAddress: getClientIP(request),
    });

    return {
      response: NextResponse.json(authResult.error, { status: 401 }),
    };
  }

  const user = authResult.user;
  const userRole = user.role as Role;

  // Check if user has one of the allowed roles
  if (!allowedRoles.includes(userRole)) {
    logAccess({
      userId: user.id,
      role: userRole,
      action: "access",
      resource: request.nextUrl.pathname,
      decision: AccessDecision.DENIED,
      reason: `Role ${userRole} not in allowed roles: ${allowedRoles.join(", ")}`,
      timestamp: new Date(),
      ipAddress: getClientIP(request),
    });

    return {
      response: NextResponse.json(
        ApiErrors.FORBIDDEN(
          `Access denied: required role(s): ${allowedRoles.join(", ")}`
        ),
        { status: 403 }
      ),
    };
  }

  // Access granted
  logAccess({
    userId: user.id,
    role: userRole,
    action: "access",
    resource: request.nextUrl.pathname,
    decision: AccessDecision.ALLOWED,
    timestamp: new Date(),
    ipAddress: getClientIP(request),
  });

  return { user };
}

/**
 * Check if user has permission (non-blocking check)
 * Use this for conditional logic without blocking the request
 */
export function checkPermission(
  user: JWTPayload,
  permission: Permission,
  resourceOwnerId?: number
): RBACResult {
  const userRole = user.role as Role;

  // Check permission
  if (!hasPermission(userRole, permission)) {
    return {
      allowed: false,
      reason: `Role ${userRole} lacks permission ${permission}`,
      user,
    };
  }

  // Check resource ownership
  if (resourceOwnerId !== undefined) {
    if (!canAccessResource(userRole, user.id, resourceOwnerId)) {
      return {
        allowed: false,
        reason: `User ${user.id} cannot access resource owned by ${resourceOwnerId}`,
        user,
      };
    }
  }

  return {
    allowed: true,
    user,
  };
}

/**
 * Check if user has role (non-blocking check)
 */
export function checkRole(user: JWTPayload, allowedRoles: Role[]): RBACResult {
  const userRole = user.role as Role;

  if (!allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: `Role ${userRole} not in allowed roles: ${allowedRoles.join(", ")}`,
      user,
    };
  }

  return {
    allowed: true,
    user,
  };
}

/**
 * Higher-order function to wrap API route handlers with RBAC
 * Usage: export const POST = withRBAC([Role.ADMIN], async (request, { user }) => { ... })
 */
export function withRBAC(
  allowedRoles: Role[],
  handler: (
    request: NextRequest,
    context: { user: JWTPayload }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { response, user } = await requireRole(request, allowedRoles);

    if (response) {
      return response;
    }

    return handler(request, { user: user! });
  };
}

/**
 * Higher-order function to wrap API route handlers with permission check
 * Usage: export const POST = withPermission(Permission.CREATE_USER, async (request, { user }) => { ... })
 */
export function withPermission(
  permission: Permission,
  handler: (
    request: NextRequest,
    context: { user: JWTPayload }
  ) => Promise<NextResponse>,
  getResourceOwnerId?: (request: NextRequest) => Promise<number | undefined>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const resourceOwnerId = getResourceOwnerId
      ? await getResourceOwnerId(request)
      : undefined;

    const { response, user } = await requirePermission(
      request,
      permission,
      resourceOwnerId
    );

    if (response) {
      return response;
    }

    return handler(request, { user: user! });
  };
}

/**
 * Utility to get user from authenticated request
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<JWTPayload | null> {
  const authResult = await requireAuth(request);
  return authResult.user;
}
