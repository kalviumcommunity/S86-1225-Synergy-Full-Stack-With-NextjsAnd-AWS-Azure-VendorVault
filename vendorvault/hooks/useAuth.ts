import { useAuthContext } from "@/context/AuthContext";

/**
 * Custom hook for authentication
 * Provides a clean interface to access and manage authentication state
 *
 * @returns {Object} Authentication state and methods
 * @property {boolean} isAuthenticated - Whether user is logged in
 * @property {User | null} user - Current user data
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
 * @property {Function} updateUser - Update user data
 * @property {boolean} isAdmin - Whether user has admin role
 * @property {boolean} isVendor - Whether user has vendor role
 */
export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthContext();

  return {
    // Core auth state
    isAuthenticated,
    user,

    // Auth actions
    login,
    logout,
    updateUser,

    // Computed properties for role checking
    isAdmin: user?.role === "admin",
    isVendor: user?.role === "vendor",

    // Helper methods
    hasRole: (role: string) => user?.role === role,
    getUserId: () => user?.id || null,
    getUserName: () => user?.username || "Guest",
    getUserEmail: () => user?.email || "",
  };
}
