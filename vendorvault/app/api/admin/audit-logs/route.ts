/**
 * @route /api/admin/audit-logs - RBAC Audit Logs API
 * @description View access control logs and security statistics
 * @access Private (ADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/config/roles";
import { requireRole } from "@/lib/rbac";
import {
  getAccessLogs,
  getAccessStats,
  AccessDecision,
  exportLogs,
  detectSuspiciousActivity,
} from "@/lib/audit-logger";
import { successResponse, ApiErrors } from "@/lib/api-response";

/**
 * GET /api/admin/audit-logs - Get access control audit logs
 *
 * Query Parameters:
 * - userId: Filter by user ID
 * - role: Filter by role (ADMIN, INSPECTOR, VENDOR)
 * - decision: Filter by decision (ALLOWED, DENIED)
 * - limit: Number of logs to return (default: 100)
 * - export: If 'true', export logs as JSON
 *
 * @access ADMIN only
 */
export async function GET(request: NextRequest) {
  // Require ADMIN role to view audit logs
  const { response } = await requireRole(request, [Role.ADMIN]);

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);

  // Check if export is requested
  const shouldExport = searchParams.get("export") === "true";

  if (shouldExport) {
    const filters = {
      userId: searchParams.get("userId")
        ? parseInt(searchParams.get("userId")!)
        : undefined,
      role: searchParams.get("role") as Role | undefined,
      decision: searchParams.get("decision") as AccessDecision | undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
    };

    const exportedData = exportLogs(filters);

    return new NextResponse(exportedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="audit-logs.json"',
      },
    });
  }

  // Build filters from query parameters
  const filters = {
    userId: searchParams.get("userId")
      ? parseInt(searchParams.get("userId")!)
      : undefined,
    role: searchParams.get("role") as Role | undefined,
    decision: searchParams.get("decision") as AccessDecision | undefined,
    limit: searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 100,
  };

  // Get logs and stats
  const logs = getAccessLogs(filters);
  const stats = getAccessStats();
  const suspicious = detectSuspiciousActivity();

  return successResponse(
    {
      logs,
      stats,
      suspicious,
      filters,
      total: logs.length,
    },
    "Audit logs retrieved successfully"
  );
}

/**
 * DELETE /api/admin/audit-logs - Clear old audit logs
 *
 * @body beforeDate: ISO date string - Clear logs before this date
 * @access ADMIN only
 */
export async function DELETE(request: NextRequest) {
  const { response } = await requireRole(request, [Role.ADMIN]);

  if (response) {
    return response;
  }

  const body = await request.json();
  const { beforeDate } = body;

  if (!beforeDate) {
    return NextResponse.json(ApiErrors.BAD_REQUEST("beforeDate is required"), {
      status: 400,
    });
  }

  // Note: clearOldLogs is commented out to preserve logs in this implementation
  // In production, you would implement proper log rotation

  return successResponse(
    {
      message:
        "Log cleanup is disabled in this implementation to preserve audit trail",
      note: "In production, implement proper log rotation to external storage",
    },
    "Operation completed"
  );
}
