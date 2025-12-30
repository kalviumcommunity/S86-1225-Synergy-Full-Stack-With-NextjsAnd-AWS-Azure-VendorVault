"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function ManageUsers() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, showError, showSuccess, startLoading, stopLoading } =
    useUI();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "INSPECTOR",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to load users");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
      } else {
        console.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    const filterUsersByRole = () => {
      if (filterRole === "all") {
        setFilteredUsers(users);
      } else {
        setFilteredUsers(
          users.filter((u) => u.role.toLowerCase() === filterRole)
        );
      }
    };
    filterUsersByRole();
  }, [filterRole, users]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      showError("Please fill in all fields");
      return;
    }

    startLoading();
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      if (!response.ok) {
        showError("Failed to create user");
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess(`${newUser.role} created successfully!`);
        setShowCreateModal(false);
        setNewUser({ name: "", email: "", password: "", role: "INSPECTOR" });
        fetchUsers();
      } else {
        showError(data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showError("An error occurred while creating user");
    } finally {
      stopLoading();
    }
  };

  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: boolean
  ) => {
    startLoading();
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        showError("Failed to update user status");
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess(
          `User ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
        fetchUsers();
      } else {
        showError(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showError("An error occurred while updating user");
    } finally {
      stopLoading();
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      INSPECTOR:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      VENDOR:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    };

    return (
      styles[role as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    inspectors: users.filter((u) => u.role === "INSPECTOR").length,
    vendors: users.filter((u) => u.role === "VENDOR").length,
    active: users.filter((u) => u.isActive).length,
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              User Management
            </h1>
            <p
              className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Manage admins, inspectors, and vendors
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            ➕ Create User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterRole("all")}
          >
            <div className="text-center">
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Total Users
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {stats.total}
              </p>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterRole("admin")}
          >
            <div className="text-center">
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Admins
              </p>
              <p className="text-3xl font-bold mt-1 text-red-600">
                {stats.admins}
              </p>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterRole("inspector")}
          >
            <div className="text-center">
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Inspectors
              </p>
              <p className="text-3xl font-bold mt-1 text-blue-600">
                {stats.inspectors}
              </p>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterRole("vendor")}
          >
            <div className="text-center">
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Vendors
              </p>
              <p className="text-3xl font-bold mt-1 text-purple-600">
                {stats.vendors}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Active
              </p>
              <p className="text-3xl font-bold mt-1 text-green-600">
                {stats.active}
              </p>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <p
              className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Filter by Role:
            </p>
            <div className="flex gap-2 flex-wrap">
              {["all", "admin", "inspector", "vendor"].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterRole === role
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? "bg-gray-800" : "bg-gray-50"}>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                  >
                    User
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                  >
                    Role
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                  >
                    Created
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p
                        className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        No users found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={
                        isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {u.name}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {u.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(u.role)}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          onClick={() =>
                            handleToggleUserStatus(u.id, u.isActive)
                          }
                          className={`text-sm ${u.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3
              className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Create New User
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                >
                  <option value="INSPECTOR">Inspector</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Create User
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({
                      name: "",
                      email: "",
                      password: "",
                      role: "INSPECTOR",
                    });
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
