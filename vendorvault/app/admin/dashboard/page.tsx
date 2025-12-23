"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedLicenses: number;
  rejectedApplications: number;
  totalVendors: number;
  activeInspectors: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { isDarkMode, showError } = useUI();

  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedLicenses: 0,
    rejectedApplications: 0,
    totalVendors: 0,
    activeInspectors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!isAdmin) {
      showError("Access denied. Admin privileges required.");
      router.push("/dashboard");
      return;
    }

    fetchDashboardStats();
  }, [isAuthenticated, user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const [vendorsRes, licensesRes, usersRes] = await Promise.all([
        fetch("/api/vendors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
          },
        }),
        fetch("/api/licenses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
          },
        }),
        fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
          },
        }),
      ]);

      if (!vendorsRes.ok || !licensesRes.ok || !usersRes.ok) {
        const errors = [];
        if (!vendorsRes.ok) errors.push(`Vendors (${vendorsRes.status})`);
        if (!licensesRes.ok) errors.push(`Licenses (${licensesRes.status})`);
        if (!usersRes.ok) errors.push(`Users (${usersRes.status})`);
        console.error("Failed to fetch:", errors.join(", "));
        showError("Failed to load dashboard data. Please try again.");
        return;
      }

      const vendors = await vendorsRes.json();
      const licenses = await licensesRes.json();
      const users = await usersRes.json();

      if (vendors.success && licenses.success && users.success) {
        const licenseData = licenses.data || [];
        setStats({
          totalApplications: vendors.data?.length || 0,
          pendingApplications: licenseData.filter(
            (l: { status: string }) => l.status === "PENDING"
          ).length,
          approvedLicenses: licenseData.filter(
            (l: { status: string }) => l.status === "APPROVED"
          ).length,
          rejectedApplications: licenseData.filter(
            (l: { status: string }) => l.status === "REJECTED"
          ).length,
          totalVendors: vendors.data?.length || 0,
          activeInspectors:
            users.data?.filter((u: { role: string }) => u.role === "INSPECTOR")
              .length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      showError("An error occurred while loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Admin Dashboard
          </h1>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Welcome back, {user?.username}! Here&apos;s your overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Applications
                </p>
                <p
                  className={`text-3xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.totalApplications}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push("/admin/applications")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Pending Review
                </p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">
                  {stats.pendingApplications}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl">
                ⏳
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Approved Licenses
                </p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  {stats.approvedLicenses}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Rejected
                </p>
                <p className="text-3xl font-bold mt-1 text-red-600">
                  {stats.rejectedApplications}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">
                ❌
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Vendors
                </p>
                <p
                  className={`text-3xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.totalVendors}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                🏪
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Active Inspectors
                </p>
                <p
                  className={`text-3xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.activeInspectors}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">
                👮
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2
            className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/admin/applications")}
              className="bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              📋 Review Applications
            </Button>
            <Button
              onClick={() => router.push("/admin/applications?filter=pending")}
              className="bg-yellow-600 hover:bg-yellow-700 py-6 text-lg"
            >
              ⏳ Pending Reviews ({stats.pendingApplications})
            </Button>
            <Button
              onClick={() => router.push("/vendors")}
              className="bg-purple-600 hover:bg-purple-700 py-6 text-lg"
            >
              🏪 Manage Vendors
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2
            className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            System Overview
          </h2>
          <div
            className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                >
                  Approval Rate
                </span>
                <span
                  className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.totalApplications > 0
                    ? Math.round(
                        (stats.approvedLicenses / stats.totalApplications) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.totalApplications > 0 ? (stats.approvedLicenses / stats.totalApplications) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
