// Custom hooks exports
export { useAuth } from "./useAuth";
export { useUI } from "./useUI";

// RBAC hooks exports
export {
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useRole,
  useCanAccessRoute,
  useUserRole,
  useIsAdmin,
  useIsInspector,
  useIsVendor,
} from "./useRBAC";

// SWR hooks exports
export {
  useUsers,
  useUser,
  useVendors,
  useVendor,
  useLicenses,
  useLicense,
  useInspections,
  useLicenseVerification,
  useApplications,
  useOptimisticMutation,
} from "./useSWR";
