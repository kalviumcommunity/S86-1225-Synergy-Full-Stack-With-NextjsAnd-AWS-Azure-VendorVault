"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/useSWR";
import { AddUserForm } from "@/components/AddUserForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSWRConfig } from "swr";

/**
 * SWR Demo Page
 *
 * This page demonstrates all key SWR features:
 * - Client-side data fetching with caching
 * - Automatic revalidation
 * - Optimistic UI updates
 * - Error handling
 * - Cache inspection
 */
export default function SWRDemoPage() {
  const { users, isLoading, isError, error, mutate } = useUsers();
  const { cache } = useSWRConfig();
  const [showCacheInfo, setShowCacheInfo] = useState(false);

  // Get all cache keys
  const getCacheKeys = () => {
    const keys: string[] = [];
    // @ts-expect-error - cache is a Map-like object
    for (const key of cache.keys()) {
      keys.push(String(key));
    }
    return keys;
  };

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-6 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600 mb-4">
            {error?.message || "Failed to load users"}
          </p>
          <Button onClick={() => mutate()} variant="secondary">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          SWR Demo - Client-Side Data Fetching
        </h1>
        <p className="text-gray-600">
          This page demonstrates SWR&apos;s stale-while-revalidate pattern,
          caching, and optimistic updates.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-2">⚡ Instant Loading</h3>
          <p className="text-sm text-gray-600">
            SWR returns cached data immediately, then revalidates in the
            background.
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <h3 className="font-bold text-lg mb-2">🔄 Auto Refresh</h3>
          <p className="text-sm text-gray-600">
            Data automatically refreshes when you refocus the window or every 30
            seconds.
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <h3 className="font-bold text-lg mb-2">✨ Optimistic UI</h3>
          <p className="text-sm text-gray-600">
            UI updates instantly before the server responds, creating a seamless
            experience.
          </p>
        </Card>
      </div>

      {/* Add User Form with Optimistic Updates */}
      <AddUserForm />

      {/* User List */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Users List</h2>
          <div className="flex gap-2">
            <Button onClick={() => mutate()} variant="secondary" size="sm">
              🔄 Refresh
            </Button>
            <Button
              onClick={() => setShowCacheInfo(!showCacheInfo)}
              variant="secondary"
              size="sm"
            >
              {showCacheInfo ? "Hide" : "Show"} Cache Info
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Total Users: <strong>{users.length}</strong>
            </p>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Cache Information Panel */}
      {showCacheInfo && (
        <Card className="p-6 bg-gray-50">
          <h3 className="text-xl font-bold mb-4">SWR Cache Information</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Active Cache Keys:
              </h4>
              <div className="bg-white p-4 rounded border border-gray-200 font-mono text-xs space-y-1">
                {getCacheKeys().length > 0 ? (
                  getCacheKeys().map((key, index) => (
                    <div key={index} className="text-gray-700">
                      • {key}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No cache entries found</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                SWR Configuration:
              </h4>
              <div className="bg-white p-4 rounded border border-gray-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revalidate on Focus:</span>
                  <span className="font-medium text-green-600">✓ Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Revalidate on Reconnect:
                  </span>
                  <span className="font-medium text-green-600">✓ Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refresh Interval:</span>
                  <span className="font-medium">30 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deduping Interval:</span>
                  <span className="font-medium">2 seconds</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                How It Works:
              </h4>
              <ul className="bg-white p-4 rounded border border-gray-200 text-sm space-y-2 text-gray-700">
                <li>
                  1️⃣ <strong>Stale-While-Revalidate:</strong> Returns cached
                  data instantly, then fetches fresh data
                </li>
                <li>
                  2️⃣ <strong>Automatic Caching:</strong> Avoids redundant
                  requests by caching responses
                </li>
                <li>
                  3️⃣ <strong>Smart Revalidation:</strong> Refreshes data on
                  window focus and periodic intervals
                </li>
                <li>
                  4️⃣ <strong>Optimistic Updates:</strong> UI updates immediately
                  before API confirmation
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 mt-6 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="font-bold text-lg mb-3">Try These Features:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            ✓ <strong>Add a user</strong> and watch the list update instantly
            (optimistic UI)
          </li>
          <li>
            ✓ <strong>Switch tabs</strong> and come back to see automatic
            revalidation
          </li>
          <li>
            ✓ <strong>Click refresh</strong> to manually revalidate the data
          </li>
          <li>
            ✓ <strong>Open DevTools Network</strong> to see SWR preventing
            duplicate requests
          </li>
          <li>
            ✓ <strong>View cache info</strong> to see what&apos;s stored in
            SWR&apos;s cache
          </li>
        </ul>
      </Card>
    </div>
  );
}
