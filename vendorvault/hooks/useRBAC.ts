/**
 * RBAC Hooks for React Components
 * Client-side hooks for role-based access control
 */

"use client";

import { useAuth } from "./useAuth";
import {
  Role,
  Permission,
  hasPermission,
  canAccessRoute,
} from "@/config/roles";

/**
 * Hook to check if current user has specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  return hasPermission(user.role as Role, permission);
}

/**
 * Hook to check if current user has any of the specified permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  return permissions.some((permission) =>
    hasPermission(user.role as Role, permission)
  );
}

/**
 * Hook to check if current user has all of the specified permissions
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  return permissions.every((permission) =>
    hasPermission(user.role as Role, permission)
  );
}

/**
 * Hook to check if current user has specific role
 */
export function useRole(allowedRoles: Role | Role[]): boolean {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role as Role);
}

/**
 * Hook to check if current user can access a specific route
 */
export function useCanAccessRoute(route: string): boolean {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  return canAccessRoute(route, user.role as Role);
}

/**
 * Hook to get current user's role
 */
export function useUserRole(): Role | null {
  const { user } = useAuth();
  return (user?.role as Role) || null;
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
  return useRole(Role.ADMIN);
}

/**
 * Hook to check if current user is inspector
 */
export function useIsInspector(): boolean {
  return useRole(Role.INSPECTOR);
}

/**
 * Hook to check if current user is vendor
 */
export function useIsVendor(): boolean {
  return useRole(Role.VENDOR);
}
