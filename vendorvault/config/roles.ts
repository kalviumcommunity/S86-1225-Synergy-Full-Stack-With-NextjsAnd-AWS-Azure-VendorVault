/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles, permissions, and access control policies
 */

/**
 * Available permissions in the system
 */
export enum Permission {
  // User Management
  CREATE_USER = "create:user",
  READ_USER = "read:user",
  UPDATE_USER = "update:user",
  DELETE_USER = "delete:user",

  // Vendor Management
  CREATE_VENDOR = "create:vendor",
  READ_VENDOR = "read:vendor",
  UPDATE_VENDOR = "update:vendor",
  DELETE_VENDOR = "delete:vendor",
  APPROVE_VENDOR = "approve:vendor",

  // License Management
  CREATE_LICENSE = "create:license",
  READ_LICENSE = "read:license",
  UPDATE_LICENSE = "update:license",
  DELETE_LICENSE = "delete:license",
  APPROVE_LICENSE = "approve:license",
  REVOKE_LICENSE = "revoke:license",

  // Inspection Management
  CREATE_INSPECTION = "create:inspection",
  READ_INSPECTION = "read:inspection",
  UPDATE_INSPECTION = "update:inspection",
  DELETE_INSPECTION = "delete:inspection",

  // Document Management
  UPLOAD_DOCUMENT = "upload:document",
  READ_DOCUMENT = "read:document",
  DELETE_DOCUMENT = "delete:document",

  // Admin Operations
  VIEW_DASHBOARD = "view:dashboard",
  VIEW_ANALYTICS = "view:analytics",
  MANAGE_SYSTEM = "manage:system",
}

/**
 * User roles in the system
 */
export enum Role {
  ADMIN = "ADMIN",
  INSPECTOR = "INSPECTOR",
  VENDOR = "VENDOR",
}

/**
 * Role-Permission Mapping
 * Defines what each role can do
 */
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Full access to all resources
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,

    Permission.CREATE_VENDOR,
    Permission.READ_VENDOR,
    Permission.UPDATE_VENDOR,
    Permission.DELETE_VENDOR,
    Permission.APPROVE_VENDOR,

    Permission.CREATE_LICENSE,
    Permission.READ_LICENSE,
    Permission.UPDATE_LICENSE,
    Permission.DELETE_LICENSE,
    Permission.APPROVE_LICENSE,
    Permission.REVOKE_LICENSE,

    Permission.CREATE_INSPECTION,
    Permission.READ_INSPECTION,
    Permission.UPDATE_INSPECTION,
    Permission.DELETE_INSPECTION,

    Permission.UPLOAD_DOCUMENT,
    Permission.READ_DOCUMENT,
    Permission.DELETE_DOCUMENT,

    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SYSTEM,
  ],

  [Role.INSPECTOR]: [
    // Can read users and vendors, create inspections
    Permission.READ_USER,
    Permission.READ_VENDOR,

    Permission.READ_LICENSE,
    Permission.APPROVE_LICENSE,
    Permission.REVOKE_LICENSE,

    Permission.CREATE_INSPECTION,
    Permission.READ_INSPECTION,
    Permission.UPDATE_INSPECTION,

    Permission.READ_DOCUMENT,

    Permission.VIEW_DASHBOARD,
  ],

  [Role.VENDOR]: [
    // Limited to own resources
    Permission.READ_USER, // Can read own profile
    Permission.UPDATE_USER, // Can update own profile

    Permission.CREATE_VENDOR, // Can apply as vendor
    Permission.READ_VENDOR, // Can read own vendor data
    Permission.UPDATE_VENDOR, // Can update own vendor data

    Permission.READ_LICENSE, // Can read own licenses

    Permission.READ_INSPECTION, // Can read own inspections

    Permission.UPLOAD_DOCUMENT, // Can upload own documents
    Permission.READ_DOCUMENT, // Can read own documents

    Permission.VIEW_DASHBOARD, // Can view own dashboard
  ],
};

/**
 * Resource ownership types for fine-grained access control
 */
export enum ResourceOwnership {
  OWN = "own", // User can only access their own resources
  ANY = "any", // User can access any resource
}

/**
 * Ownership rules for each role
 * Determines whether a role can access only their own resources or any resource
 */
export const roleOwnership: Record<Role, ResourceOwnership> = {
  [Role.ADMIN]: ResourceOwnership.ANY,
  [Role.INSPECTOR]: ResourceOwnership.ANY,
  [Role.VENDOR]: ResourceOwnership.OWN,
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if a user can access a resource based on ownership
 */
export function canAccessResource(
  userRole: Role,
  userId: number,
  resourceOwnerId: number
): boolean {
  // Admins and inspectors can access any resource
  if (roleOwnership[userRole] === ResourceOwnership.ANY) {
    return true;
  }

  // Vendors can only access their own resources
  return userId === resourceOwnerId;
}

/**
 * Role hierarchy for privilege comparison
 * Higher number = more privileges
 */
export const roleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 3,
  [Role.INSPECTOR]: 2,
  [Role.VENDOR]: 1,
};

/**
 * Check if one role has higher privileges than another
 */
export function hasHigherPrivilege(role1: Role, role2: Role): boolean {
  return roleHierarchy[role1] > roleHierarchy[role2];
}

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/verify",
  "/auth/login",
  "/auth/register",
  "/verify",
  "/contact",
];

/**
 * Route-Role mapping for page access
 */
export const routeRoleMap: Record<string, Role[]> = {
  "/admin": [Role.ADMIN],
  "/admin/*": [Role.ADMIN],
  "/inspector": [Role.INSPECTOR, Role.ADMIN],
  "/inspector/*": [Role.INSPECTOR, Role.ADMIN],
  "/vendor": [Role.VENDOR, Role.ADMIN],
  "/vendor/*": [Role.VENDOR, Role.ADMIN],
  "/dashboard": [Role.ADMIN, Role.INSPECTOR, Role.VENDOR],
};

/**
 * Check if a role can access a route
 */
export function canAccessRoute(route: string, role: Role): boolean {
  // Check public routes
  if (publicRoutes.some((publicRoute) => route.startsWith(publicRoute))) {
    return true;
  }

  // Check exact match
  if (routeRoleMap[route]) {
    return routeRoleMap[route].includes(role);
  }

  // Check wildcard match
  const routeKey = Object.keys(routeRoleMap).find((key) => {
    if (key.endsWith("/*")) {
      const baseRoute = key.slice(0, -2);
      return route.startsWith(baseRoute);
    }
    return false;
  });

  if (routeKey) {
    return routeRoleMap[routeKey].includes(role);
  }

  // Default: allow access if not explicitly restricted
  return true;
}
