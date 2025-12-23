/**
 * SWR Fetcher Utility
 *
 * A generic fetcher function for use with SWR hooks.
 * Handles API responses and throws errors for failed requests.
 */

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("Failed to fetch data") as Error & {
      info?: unknown;
      status?: number;
    };
    // Attach extra info to the error object
    const errorInfo = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    error.info = errorInfo;
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * Fetcher with authentication token
 * Useful for authenticated API requests
 */
export const fetcherWithAuth = async (url: string) => {
  const token = localStorage.getItem("authToken");

  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = new Error("Failed to fetch data") as Error & {
      info?: unknown;
      status?: number;
    };
    const errorInfo = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    error.info = errorInfo;
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * Fetcher with custom options
 * Allows passing custom fetch options
 */
export const fetcherWithOptions = (options?: RequestInit) => {
  return async (url: string) => {
    const res = await fetch(url, options);

    if (!res.ok) {
      const error = new Error("Failed to fetch data") as Error & {
        info?: unknown;
        status?: number;
      };
      const errorInfo = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      error.info = errorInfo;
      error.status = res.status;
      throw error;
    }

    return res.json();
  };
};
