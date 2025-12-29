"use client";
import { useEffect, useState, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetcherWithAuth } from "@/lib/fetcher";

interface LicenseData {
  id: number;
  licenseNumber: string;
  status: string;
  issuedAt: string | null;
  expiresAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export default function VendorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isVendor } = useAuth();
  const { isDarkMode, showError } = useUI();
  const [mounted, setMounted] = useState(false);

  // SWR for vendor data
  const {
    data: vendorResponse,
    error: vendorError,
    isLoading: vendorLoading,
  } = useSWR(
    user?.id ? `/api/vendors?userId=${user.id}` : null,
    fetcherWithAuth,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      onError: (err) => {
        console.error("Error fetching vendor data:", err);
        showError("Failed to load vendor data");
      },
    }
  );

  const vendor =
    vendorResponse?.success && vendorResponse.data?.length > 0
      ? vendorResponse.data[0]
      : null;

  // SWR for licenses data - only fetch if we have a vendor
  const { data: licensesResponse, isLoading: licensesLoading } = useSWR(
    vendor?.id ? `/api/licenses?vendorId=${vendor.id}` : null,
    fetcherWithAuth,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
      onError: (err) => {
        console.error("Error fetching licenses:", err);
      },
    }
  );

  const licenses = licensesResponse?.success ? licensesResponse.data : [];
  const loading = vendorLoading || (vendor && licensesLoading);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!isVendor) {
      showError("Access denied. Vendor role required.");
      router.push("/dashboard");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isVendor]);

  if (!mounted) {
    return null;
  }

  const hasApplied = vendor !== null;

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

  if (vendorError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <div className="text-red-600 text-center">
            <p className="font-bold mb-2">Error Loading Dashboard</p>
            <p className="text-sm">{vendorError.message}</p>
            <Button
              onClick={() => mutate(`/api/vendors?userId=${user?.id}`)}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasApplied) {
    return (
      <div
        className={`min-h-screen py-12 px-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2
              className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              No Application Found
            </h2>
            <p
              className={`text-lg mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              You haven&apos;t submitted a vendor application yet. Start by
              filling out the application form.
            </p>
            <Button
              onClick={() => router.push("/vendor/apply")}
              className="px-8 py-3"
            >
              Apply for Vendor License
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const pendingLicense = licenses.find(
    (l: LicenseData) => l.status === "PENDING"
  );
  const approvedLicense = licenses.find(
    (l: LicenseData) => l.status === "APPROVED"
  );
  const rejectedLicense = licenses.find(
    (l: LicenseData) => l.status === "REJECTED"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "REJECTED":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case "EXPIRED":
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400";
      case "REVOKED":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Welcome back, {user?.username}!
          </h1>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Manage your vendor application and licenses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Application Status
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {pendingLicense
                    ? "Under Review"
                    : approvedLicense
                      ? "Approved"
                      : rejectedLicense
                        ? "Rejected"
                        : "Submitted"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Licenses
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {licenses.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                📜
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Station
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {vendor?.stationName}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                🚉
              </div>
            </div>
          </Card>
        </div>

        {/* Application Status Card */}
        {pendingLicense && (
          <Card className="p-6 mb-6 border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⏳</div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Application Under Review
                </h3>
                <p
                  className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Your application is currently being reviewed by our admin
                  team. We&apos;ll notify you once a decision has been made.
                </p>
                <div className="flex gap-4">
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Application ID
                    </p>
                    <p
                      className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {pendingLicense.licenseNumber}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Submitted On
                    </p>
                    <p
                      className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {new Date(vendor?.createdAt || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {rejectedLicense && !approvedLicense && (
          <Card className="p-6 mb-6 border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <div className="text-4xl">❌</div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Application Rejected
                </h3>
                <p
                  className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Unfortunately, your application has been rejected.
                </p>
                {rejectedLicense.rejectionReason && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${isDarkMode ? "bg-red-900/20" : "bg-red-50"}`}
                  >
                    <p
                      className={`text-sm font-medium mb-1 ${isDarkMode ? "text-red-300" : "text-red-800"}`}
                    >
                      Reason for Rejection:
                    </p>
                    <p className={isDarkMode ? "text-red-200" : "text-red-700"}>
                      {rejectedLicense.rejectionReason}
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => router.push("/vendor/apply")}
                  variant="secondary"
                >
                  Submit New Application
                </Button>
              </div>
            </div>
          </Card>
        )}

        {approvedLicense && (
          <Card className="p-6 mb-6 border-l-4 border-green-500">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✅</div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  License Approved!
                </h3>
                <p
                  className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Congratulations! Your vendor license has been approved.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      License Number
                    </p>
                    <p
                      className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {approvedLicense.licenseNumber}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Issued Date
                    </p>
                    <p
                      className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {approvedLicense.issuedAt
                        ? new Date(
                            approvedLicense.issuedAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Expires On
                    </p>
                    <p
                      className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {approvedLicense.expiresAt
                        ? new Date(
                            approvedLicense.expiresAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(approvedLicense.status)}`}
                    >
                      {approvedLicense.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() =>
                      router.push(`/verify/${approvedLicense.licenseNumber}`)
                    }
                  >
                    View QR Code
                  </Button>
                  <Button variant="secondary" onClick={() => window.print()}>
                    Download License
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Business Information */}
        <Card className="p-6 mb-6">
          <h3
            className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Business Name
              </p>
              <p
                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {vendor?.businessName}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Station
              </p>
              <p
                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {vendor?.stationName}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Application Date
              </p>
              <p
                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {vendor?.createdAt
                  ? new Date(vendor.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        {/* License History */}
        {licenses.length > 0 && (
          <Card className="p-6">
            <h3
              className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              License History
            </h3>
            <div className="space-y-3">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {license.licenseNumber}
                      </p>
                      <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {license.issuedAt
                          ? `Issued: ${new Date(license.issuedAt).toLocaleDateString()}`
                          : "Not issued yet"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(license.status)}`}
                    >
                      {license.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
