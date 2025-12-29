/**
 * RBAC Demo Page
 * Demonstrates role-based access control in action
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RequirePermission,
  AdminOnly,
  InspectorOnly,
  VendorOnly,
  RoleSwitch,
  UnauthorizedMessage,
} from "@/components/RBACComponents";
import { useUserRole, useIsAdmin } from "@/hooks/useRBAC";
import { Permission } from "@/config/roles";

interface AuditLogData {
  logs: Array<{
    userId: number | null;
    role: string | null;
    action: string;
    resource: string;
    decision: string;
    timestamp: string;
  }>;
  stats: {
    total: number;
    allowed: number;
    denied: number;
  };
  suspicious: {
    suspiciousUsers: number[];
  };
}

export default function RBACDemoPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogData | null>(null);
  const [loading, setLoading] = useState(false);
  const userRole = useUserRole();
  const isAdmin = useIsAdmin();

  const fetchAuditLogs = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/audit-logs?limit=20", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs();
    }
  }, [isAdmin, fetchAuditLogs]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">🔐 RBAC Demo & Testing</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This page demonstrates Role-Based Access Control (RBAC)
          implementation. Different sections are visible based on your current
          role.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold">
            Your Current Role:
            <span className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
              {userRole || "Not Authenticated"}
            </span>
          </p>
        </div>
      </div>

      {/* Role-Based Section Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Section */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>👑</span> Admin Section
          </h2>
          <AdminOnly
            fallback={<UnauthorizedMessage message="Admin access required" />}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ✅ You have full system access
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Manage all users</li>
                <li>View audit logs</li>
                <li>System configuration</li>
                <li>Approve/revoke licenses</li>
              </ul>
            </div>
          </AdminOnly>
        </div>

        {/* Inspector Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>🔍</span> Inspector Section
          </h2>
          <InspectorOnly
            fallback={
              <UnauthorizedMessage message="Inspector access required" />
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ✅ You can perform inspections
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Create inspections</li>
                <li>Review licenses</li>
                <li>Approve/revoke licenses</li>
                <li>View vendor data</li>
              </ul>
            </div>
          </InspectorOnly>
        </div>

        {/* Vendor Section */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>🏪</span> Vendor Section
          </h2>
          <VendorOnly
            fallback={<UnauthorizedMessage message="Vendor access required" />}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ✅ You can manage your stall
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>View your profile</li>
                <li>Apply for licenses</li>
                <li>Upload documents</li>
                <li>View inspections</li>
              </ul>
            </div>
          </VendorOnly>
        </div>
      </div>

      {/* Permission-Based Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Permission-Based Actions</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          These buttons are only visible if you have the required permissions:
        </p>

        <div className="flex flex-wrap gap-3">
          <RequirePermission permission={Permission.CREATE_USER}>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              ➕ Create User
            </button>
          </RequirePermission>

          <RequirePermission permission={Permission.DELETE_USER}>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              🗑️ Delete User
            </button>
          </RequirePermission>

          <RequirePermission permission={Permission.APPROVE_LICENSE}>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              ✅ Approve License
            </button>
          </RequirePermission>

          <RequirePermission permission={Permission.CREATE_INSPECTION}>
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              🔍 Create Inspection
            </button>
          </RequirePermission>

          <RequirePermission permission={Permission.VIEW_ANALYTICS}>
            <button className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
              📊 View Analytics
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* Audit Logs (Admin Only) */}
      <AdminOnly>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📋 Audit Logs</h2>

          {loading && <p>Loading audit logs...</p>}

          {auditLogs && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold">{auditLogs.stats.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allowed
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {auditLogs.stats.allowed}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Denied
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {auditLogs.stats.denied}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Suspicious
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {auditLogs.suspicious.suspiciousUsers.length}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <h3 className="font-semibold mb-2">Recent Logs:</h3>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        Role
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        Action
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        Resource
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        Decision
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {auditLogs.logs.slice(0, 10).map((log, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          {log.userId || "Anonymous"}
                        </td>
                        <td className="px-4 py-2 text-sm">{log.role || "-"}</td>
                        <td className="px-4 py-2 text-sm">{log.action}</td>
                        <td className="px-4 py-2 text-xs">{log.resource}</td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              log.decision === "ALLOWED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {log.decision}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminOnly>

      {/* Role Switch Example */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Dynamic Content by Role</h2>

        <RoleSwitch
          admin={
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <h3 className="font-bold text-lg mb-2">👑 Admin Dashboard</h3>
              <p>You have administrative privileges with full system access.</p>
            </div>
          }
          inspector={
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-lg mb-2">🔍 Inspector Dashboard</h3>
              <p>You can perform inspections and manage licenses.</p>
            </div>
          }
          vendor={
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-lg mb-2">🏪 Vendor Dashboard</h3>
              <p>You can manage your stall and view your licenses.</p>
            </div>
          }
          fallback={
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
              <p>Please log in to see role-specific content.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
