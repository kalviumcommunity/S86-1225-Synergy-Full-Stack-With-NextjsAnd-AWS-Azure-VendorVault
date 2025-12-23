"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "./ui/Button";
import { InputField } from "./ui/InputField";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

/**
 * AddUserForm Component
 *
 * Demonstrates SWR mutations with optimistic UI updates.
 * - Updates UI instantly before API call completes
 * - Automatically revalidates data after mutation
 * - Handles errors gracefully with rollback
 */
export function AddUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: users } = useSWR<User[]>("/api/users", fetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name || !email) {
      setError("Name and email are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new user object for optimistic update
      const newUser: User = {
        id: `temp-${Date.now()}`, // Temporary ID
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      };

      // OPTIMISTIC UPDATE: Update UI immediately
      mutate(
        "/api/users",
        async (currentUsers: User[] = []) => {
          // Add new user to the list optimistically
          return [...currentUsers, newUser];
        },
        false // Don't revalidate immediately
      );

      // Actual API call
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
        body: JSON.stringify({ name, email, role }),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      await response.json();

      // Revalidate to sync with server data
      await mutate("/api/users");

      setSuccessMessage(`User "${name}" added successfully!`);
      setName("");
      setEmail("");
      setRole("USER");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");

      // Rollback optimistic update on error
      mutate("/api/users");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Add New User</h2>
      <p className="text-gray-600 mb-6 text-sm">
        This form demonstrates <strong>optimistic UI updates</strong> with SWR.
        The user list updates instantly, even before the server responds.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter user name"
          required
        />

        <InputField
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
        />

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USER">User</option>
            <option value="VENDOR">Vendor</option>
            <option value="ADMIN">Admin</option>
            <option value="INSPECTOR">Inspector</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="text-sm">✓ {successMessage}</p>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding User...
            </span>
          ) : (
            "Add User"
          )}
        </Button>
      </form>

      {/* Current user count */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Current Users:</strong> {users?.length || 0}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Watch this number update instantly when you add a user (optimistic
          update)!
        </p>
      </div>
    </div>
  );
}
