"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface LicenseData {
  id: number;
  licenseNumber: string;
  status: string;
  vendor: {
    id: number;
    businessName: string;
    stationName: string;
    user: {
      name: string;
      email: string;
      phone: string;
    };
  };
  issuedAt: string | null;
  expiresAt: string | null;
}

export default function InspectorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, showError, showSuccess, startLoading, stopLoading } =
    useUI();

  const [verificationMode, setVerificationMode] = useState<"qr" | "manual">(
    "manual"
  );
  const [licenseInput, setLicenseInput] = useState("");
  const [verifiedLicense, setVerifiedLicense] = useState<LicenseData | null>(
    null
  );
  const [recentVerifications, setRecentVerifications] = useState<LicenseData[]>(
    []
  );
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== "INSPECTOR") {
      showError("Access denied. Inspector role required.");
      router.push("/dashboard");
      return;
    }

    loadRecentVerifications();
  }, [isAuthenticated, user]);

  const loadRecentVerifications = async () => {
    try {
      const response = await fetch("/api/licenses?status=APPROVED&limit=10", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setRecentVerifications(data.data || []);
      }
    } catch (error) {
      console.error("Error loading verifications:", error);
    }
  };

  const handleVerifyLicense = async () => {
    if (!licenseInput.trim()) {
      showError("Please enter a license number");
      return;
    }

    startLoading();
    try {
      const response = await fetch(
        `/api/verify?licenceNumber=${licenseInput}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setVerifiedLicense(data.data);
        showSuccess("License verified successfully!");

        // Log verification
        await logVerification(data.data.id);

        // Add to recent verifications
        setRecentVerifications((prev) => [data.data, ...prev.slice(0, 9)]);
      } else {
        showError("License not found or invalid");
        setVerifiedLicense(null);
      }
    } catch (error) {
      console.error("Error verifying license:", error);
      showError("Failed to verify license");
      setVerifiedLicense(null);
    } finally {
      stopLoading();
    }
  };

  const logVerification = async (licenseId: number) => {
    try {
      await fetch("/api/inspections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
        body: JSON.stringify({
          licenseId: licenseId,
          inspectorId: user?.id,
          verificationType:
            verificationMode === "qr" ? "QR_SCAN" : "MANUAL_ENTRY",
        }),
      });
    } catch (error) {
      console.warn("Failed to log verification:", error);
    }
  };

  const handleQRScan = () => {
    setScanning(true);
    showSuccess(
      "QR Scanner activated! (Demo mode - enter license number manually)"
    );
    setVerificationMode("qr");
    setTimeout(() => setScanning(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "EXPIRED":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case "REVOKED":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const isLicenseValid = (license: LicenseData) => {
    if (license.status !== "APPROVED") return false;
    if (!license.expiresAt) return true;
    return new Date(license.expiresAt) > new Date();
  };

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
            Inspector Dashboard
          </h1>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Verify vendor licenses via QR code or manual entry
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Panel */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2
                className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                License Verification
              </h2>

              {/* Mode Selector */}
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => setVerificationMode("manual")}
                  className={
                    verificationMode === "manual"
                      ? "bg-blue-600"
                      : "bg-gray-500"
                  }
                >
                  📝 Manual Entry
                </Button>
                <Button
                  onClick={handleQRScan}
                  className={
                    verificationMode === "qr" ? "bg-blue-600" : "bg-gray-500"
                  }
                >
                  📷 QR Scanner
                </Button>
              </div>

              {/* QR Scanner Area */}
              {verificationMode === "qr" && (
                <div
                  className={`mb-6 p-8 rounded-lg border-2 border-dashed ${scanning ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                >
                  <div className="text-center">
                    {scanning ? (
                      <>
                        <div className="animate-pulse text-6xl mb-4">📷</div>
                        <p
                          className={`text-lg font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                        >
                          Scanning QR Code...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">📱</div>
                        <p
                          className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          Position QR Code in Frame
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Camera will automatically detect and scan the code
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Entry */}
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                  >
                    License Number or QR Code Data
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={licenseInput}
                      onChange={(e) => setLicenseInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleVerifyLicense()
                      }
                      placeholder="Enter license number (e.g., LIC-2024-001234)"
                      className={`flex-1 px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500`}
                    />
                    <Button onClick={handleVerifyLicense} className="px-8">
                      Verify
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification Result */}
              {verifiedLicense && (
                <div
                  className={`mt-6 p-6 rounded-lg border-2 ${isLicenseValid(verifiedLicense) ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-red-500 bg-red-50 dark:bg-red-900/20"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">
                      {isLicenseValid(verifiedLicense) ? "✅" : "❌"}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold mb-3 ${isLicenseValid(verifiedLicense) ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                      >
                        {isLicenseValid(verifiedLicense)
                          ? "Valid License"
                          : "Invalid License"}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            License Number
                          </p>
                          <p
                            className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {verifiedLicense.licenseNumber}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Status
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verifiedLicense.status)}`}
                          >
                            {verifiedLicense.status}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg mb-4 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                      >
                        <h4
                          className={`font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          Vendor Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span
                              className={
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }
                            >
                              Business:
                            </span>
                            <span
                              className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {verifiedLicense.vendor.businessName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span
                              className={
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }
                            >
                              Owner:
                            </span>
                            <span
                              className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {verifiedLicense.vendor.user.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span
                              className={
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }
                            >
                              Station:
                            </span>
                            <span
                              className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {verifiedLicense.vendor.stationName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span
                              className={
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }
                            >
                              Contact:
                            </span>
                            <span
                              className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {verifiedLicense.vendor.user.phone ||
                                verifiedLicense.vendor.user.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }
                          >
                            Issued Date
                          </p>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {verifiedLicense.issuedAt
                              ? new Date(
                                  verifiedLicense.issuedAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }
                          >
                            Expiry Date
                          </p>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {verifiedLicense.expiresAt
                              ? new Date(
                                  verifiedLicense.expiresAt
                                ).toLocaleDateString()
                              : "No expiry"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Recent Verifications Sidebar */}
          <div>
            <Card className="p-6">
              <h3
                className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Recent Verifications
              </h3>

              <div className="space-y-3">
                {recentVerifications.length === 0 ? (
                  <p
                    className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    No recent verifications
                  </p>
                ) : (
                  recentVerifications.map((license) => (
                    <div
                      key={license.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition ${isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
                      onClick={() => {
                        setLicenseInput(license.licenseNumber);
                        setVerifiedLicense(license);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {license.licenseNumber}
                        </p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(license.status)}`}
                        >
                          {license.status}
                        </span>
                      </div>
                      <p
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {license.vendor.businessName}
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                      >
                        {license.vendor.stationName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 mt-6">
              <h3
                className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Today&apos;s Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Verifications
                  </span>
                  <span
                    className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {recentVerifications.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Valid Licenses
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {
                      recentVerifications.filter((l) => isLicenseValid(l))
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Invalid
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {
                      recentVerifications.filter((l) => !isLicenseValid(l))
                        .length
                    }
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
