/**
 * Token Management Utilities
 * Client-side helpers for managing JWT tokens and automatic refresh
 */

/**
 * Store access token in memory (not localStorage to prevent XSS)
 */
let accessToken: string | null = null;

/**
 * Set access token in memory
 */
export function setAccessToken(token: string) {
  accessToken = token;
}

/**
 * Get access token from memory
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Clear access token from memory
 */
export function clearAccessToken() {
  accessToken = null;
}

/**
 * Refresh access token using refresh token from HTTP-only cookie
 * @returns New access token or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      // Refresh token expired or invalid - user needs to login again
      clearAccessToken();
      return null;
    }

    const data = await response.json();
    const newToken = data.data?.accessToken;

    if (newToken) {
      setAccessToken(newToken);
      return newToken;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    clearAccessToken();
    return null;
  }
}

/**
 * Fetch with automatic token refresh
 * Automatically retries request with new token if 401 error occurs
 *
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get current access token
  const token = getAccessToken();

  // Add authorization header
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Make request
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include cookies for refresh token
  });

  // If 401 Unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log("Access token expired, attempting refresh...");

    // Attempt to refresh token
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry request with new token
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      // Refresh failed - redirect to login
      console.log("Token refresh failed, user needs to login again");
      // In a real app, you might want to redirect to login page here
      // window.location.href = '/auth/login';
    }
  }

  return response;
}

/**
 * Login user and store tokens
 *
 * @param email - User email
 * @param password - User password
 * @returns Login response data or null if failed
 */
export async function login(
  email: string,
  password: string
): Promise<{
  user: unknown;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
} | null> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    // Store access token in memory
    if (data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }

    return data.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Logout user and clear all tokens
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // Include cookies
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local token
    clearAccessToken();
  }
}
