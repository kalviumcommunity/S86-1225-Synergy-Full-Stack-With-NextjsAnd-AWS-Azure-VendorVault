/**
 * RBAC UI Components
 * Components for role-based conditional rendering
 */

"use client";

import { ReactNode } from "react";
import { Role, Permission } from "@/config/roles";
import {
  useRole,
  usePermission,
  useAnyPermission,
  useAllPermissions,
} from "@/hooks/useRBAC";

/**
 * Props for role-based components
 */
interface RoleGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Show content only if user has specific role(s)
 *
 * @example
 * <RequireRole roles={[Role.ADMIN, Role.INSPECTOR]}>
 *   <AdminPanel />
 * </RequireRole>
 */
export function RequireRole({
  roles,
  children,
  fallback = null,
}: RoleGuardProps & { roles: Role | Role[] }) {
  const hasRole = useRole(roles);
  return hasRole ? <>{children}</> : <>{fallback}</>;
}

/**
 * Show content only if user has specific permission
 *
 * @example
 * <RequirePermission permission={Permission.DELETE_USER}>
 *   <button>Delete User</button>
 * </RequirePermission>
 */
export function RequirePermission({
  permission,
  children,
  fallback = null,
}: RoleGuardProps & { permission: Permission }) {
  const hasPermissionFlag = usePermission(permission);
  return hasPermissionFlag ? <>{children}</> : <>{fallback}</>;
}

/**
 * Show content only if user has ANY of the specified permissions
 *
 * @example
 * <RequireAnyPermission permissions={[Permission.UPDATE_USER, Permission.DELETE_USER]}>
 *   <button>Manage User</button>
 * </RequireAnyPermission>
 */
export function RequireAnyPermission({
  permissions,
  children,
  fallback = null,
}: RoleGuardProps & { permissions: Permission[] }) {
  const hasAnyPermissionFlag = useAnyPermission(permissions);
  return hasAnyPermissionFlag ? <>{children}</> : <>{fallback}</>;
}

/**
 * Show content only if user has ALL of the specified permissions
 *
 * @example
 * <RequireAllPermissions permissions={[Permission.READ_USER, Permission.UPDATE_USER]}>
 *   <button>Edit User</button>
 * </RequireAllPermissions>
 */
export function RequireAllPermissions({
  permissions,
  children,
  fallback = null,
}: RoleGuardProps & { permissions: Permission[] }) {
  const hasAllPermissionsFlag = useAllPermissions(permissions);
  return hasAllPermissionsFlag ? <>{children}</> : <>{fallback}</>;
}

/**
 * Show content only to ADMIN users
 *
 * @example
 * <AdminOnly>
 *   <AdminDashboard />
 * </AdminOnly>
 */
export function AdminOnly({ children, fallback = null }: RoleGuardProps) {
  return (
    <RequireRole roles={Role.ADMIN} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

/**
 * Show content only to INSPECTOR users (and ADMIN)
 *
 * @example
 * <InspectorOnly>
 *   <InspectionPanel />
 * </InspectorOnly>
 */
export function InspectorOnly({
  children,
  fallback = null,
  includeAdmin = true,
}: RoleGuardProps & { includeAdmin?: boolean }) {
  const roles = includeAdmin ? [Role.INSPECTOR, Role.ADMIN] : [Role.INSPECTOR];
  return (
    <RequireRole roles={roles} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

/**
 * Show content only to VENDOR users (and optionally ADMIN)
 *
 * @example
 * <VendorOnly>
 *   <VendorDashboard />
 * </VendorOnly>
 */
export function VendorOnly({
  children,
  fallback = null,
  includeAdmin = false,
}: RoleGuardProps & { includeAdmin?: boolean }) {
  const roles = includeAdmin ? [Role.VENDOR, Role.ADMIN] : [Role.VENDOR];
  return (
    <RequireRole roles={roles} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

/**
 * Render different content based on user role
 *
 * @example
 * <RoleSwitch
 *   admin={<AdminView />}
 *   inspector={<InspectorView />}
 *   vendor={<VendorView />}
 *   fallback={<LoginPrompt />}
 * />
 */
export function RoleSwitch({
  admin,
  inspector,
  vendor,
  fallback = null,
}: {
  admin?: ReactNode;
  inspector?: ReactNode;
  vendor?: ReactNode;
  fallback?: ReactNode;
}) {
  const isAdmin = useRole(Role.ADMIN);
  const isInspector = useRole(Role.INSPECTOR);
  const isVendor = useRole(Role.VENDOR);

  if (isAdmin && admin) return <>{admin}</>;
  if (isInspector && inspector) return <>{inspector}</>;
  if (isVendor && vendor) return <>{vendor}</>;

  return <>{fallback}</>;
}

/**
 * Unauthorized access message component
 */
export function UnauthorizedMessage({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      <p className="text-gray-600 dark:text-gray-400">
        {message || "You do not have permission to access this resource."}
      </p>
    </div>
  );
}
