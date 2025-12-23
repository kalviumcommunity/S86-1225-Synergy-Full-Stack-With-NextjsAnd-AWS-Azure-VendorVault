"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function UsersPage() {
  const { data, error, isLoading } = useSWR<User[]>("/api/users", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000, // Auto-refresh every 30 seconds
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search
  const filteredUsers = data?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <main className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error Loading Users</p>
          <p className="text-sm">{error.message || "Failed to load users."}</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">View and manage all users in the system</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Users Count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredUsers?.length || 0} of {data?.length || 0} users
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Auto-refreshing</span>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredUsers && filteredUsers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <Link href={`/users/${user.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {user.role || "User"}
                      </span>
                      {user.createdAt && (
                        <span className="text-xs text-gray-500">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No users found matching your search.</p>
          </div>
        )}
      </div>

      {/* Cache Info (for debugging) */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-semibold mb-2">SWR Cache Info:</p>
        <ul className="space-y-1">
          <li>✓ Revalidates on window focus</li>
          <li>✓ Auto-refreshes every 30 seconds</li>
          <li>✓ Cached data served instantly</li>
          <li>✓ Background revalidation enabled</li>
        </ul>
      </div>
    </main>
  );
}
