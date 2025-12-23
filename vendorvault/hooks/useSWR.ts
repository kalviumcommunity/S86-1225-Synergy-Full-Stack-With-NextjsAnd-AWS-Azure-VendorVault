/**
 * Custom SWR Hooks
 *
 * Reusable hooks for common data fetching patterns in VendorVault.
 * These hooks encapsulate SWR configuration and provide type-safe data access.
 */

import useSWR, { SWRConfiguration } from "swr";
import { fetcher, fetcherWithAuth } from "@/lib/fetcher";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface Vendor {
  id: number;
  businessName: string;
  stationName: string;
  userId: string;
  createdAt: string;
}

interface License {
  id: number;
  licenseNumber: string;
  status: string;
  vendorId: number;
  issuedAt: string | null;
  expiresAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

// Default SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 30000, // 30 seconds
  dedupingInterval: 2000, // 2 seconds
};

/**
 * useUsers Hook
 * Fetches all users with automatic caching and revalidation
 */
export function useUsers(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<User[]>(
    "/api/users",
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    users: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * useUser Hook
 * Fetches a single user by ID
 */
export function useUser(userId: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    userId ? `/api/users/${userId}` : null,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * useVendors Hook
 * Fetches all vendors or filters by userId
 */
export function useVendors(userId?: string, config?: SWRConfiguration) {
  const endpoint = userId ? `/api/vendors?userId=${userId}` : "/api/vendors";

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: Vendor[];
  }>(endpoint, fetcherWithAuth, { ...defaultConfig, ...config });

  return {
    vendors: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * useVendor Hook
 * Fetches a single vendor by ID
 */
export function useVendor(vendorId: number | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: Vendor;
  }>(vendorId ? `/api/vendors/${vendorId}` : null, fetcherWithAuth, {
    ...defaultConfig,
    ...config,
  });

  return {
    vendor: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * useLicenses Hook
 * Fetches licenses, optionally filtered by vendorId
 */
export function useLicenses(vendorId?: number, config?: SWRConfiguration) {
  const endpoint = vendorId
    ? `/api/licenses?vendorId=${vendorId}`
    : "/api/licenses";

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: License[];
  }>(endpoint, fetcherWithAuth, { ...defaultConfig, ...config });

  return {
    licenses: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * useLicense Hook
 * Fetches a single license by ID or license number
 */
export function useLicense(
  licenseIdentifier: number | string | null,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: License;
  }>(
    licenseIdentifier ? `/api/licenses/${licenseIdentifier}` : null,
    fetcherWithAuth,
    { ...defaultConfig, ...config }
  );

  return {
    license: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * useInspections Hook
 * Fetches inspections data
 */
export function useInspections(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/inspections",
    fetcherWithAuth,
    { ...defaultConfig, ...config }
  );

  return {
    inspections: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * useLicenseVerification Hook
 * Verifies a license by license number
 */
export function useLicenseVerification(
  licenseNumber: string | null,
  config?: SWRConfiguration
) {
  const { data, error, isLoading } = useSWR(
    licenseNumber ? `/api/verify?licenseNumber=${licenseNumber}` : null,
    fetcher,
    {
      ...defaultConfig,
      revalidateOnFocus: false, // Don't revalidate on focus for verification
      ...config,
    }
  );

  return {
    verification: data,
    isValid: data?.success && data?.data?.isValid,
    isLoading,
    isError: !!error,
    error,
  };
}

/**
 * useApplications Hook
 * Fetches vendor applications (admin view)
 */
export function useApplications(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/admin/applications",
    fetcherWithAuth,
    { ...defaultConfig, ...config }
  );

  return {
    applications: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for optimistic mutations
 * Provides helper functions for common mutation patterns
 */
export function useOptimisticMutation<T>(key: string) {
  const { mutate } = useSWR<T>(key);

  const optimisticUpdate = async (
    updateFn: (currentData: T) => T,
    apiFn: () => Promise<unknown>
  ) => {
    try {
      // Update UI optimistically
      await mutate(updateFn, false);

      // Perform API call
      await apiFn();

      // Revalidate to sync with server
      await mutate();
    } catch (error) {
      // Rollback on error
      await mutate();
      throw error;
    }
  };

  return { optimisticUpdate, mutate };
}
