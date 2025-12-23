"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface VendorApplication {
  id: number;
  businessName: string;
  stationName: string;
  stallType: string;
  city: string;
  state: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  licenses: Array<{
    id: number;
    licenseNumber: string;
    status: string;
  }>;
}

export default function AdminApplications() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { isDarkMode, showError, showSuccess, startLoading, stopLoading } =
    useUI();

  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    VendorApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<VendorApplication | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

    fetchApplications();
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterApplicationsByStatus();
  }, [filterStatus, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/vendors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
      });

      if (!response.ok) {
        showError("Failed to load applications");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
      } else {
        showError("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      showError("An error occurred while loading applications");
    } finally {
      setLoading(false);
    }
  };

  const filterApplicationsByStatus = () => {
    if (filterStatus === "all") {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter((app) => {
        const latestLicense = app.licenses[0];
        if (!latestLicense) return filterStatus === "no-license";
        return latestLicense.status === filterStatus.toUpperCase();
      });
      setFilteredApplications(filtered);
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    startLoading();
    try {
      const response = await fetch("/api/license/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
        body: JSON.stringify({
          vendorId: selectedApplication.id,
          approvedById: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Application approved successfully!");
        setShowApprovalModal(false);
        setSelectedApplication(null);
        fetchApplications();
      } else {
        showError(data.message || "Failed to approve application");
      }
    } catch (error) {
      console.error("Error approving application:", error);
      showError("An error occurred while approving the application");
    } finally {
      stopLoading();
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      showError("Please provide a reason for rejection");
      return;
    }

    startLoading();
    try {
      const latestLicense = selectedApplication.licenses[0];

      const response = await fetch(`/api/licenses/${latestLicense.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Application rejected");
        setShowRejectionModal(false);
        setSelectedApplication(null);
        setRejectionReason("");
        fetchApplications();
      } else {
        showError(data.message || "Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      showError("An error occurred while rejecting the application");
    } finally {
      stopLoading();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      APPROVED:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
    };

    return (
      styles[status as keyof typeof styles] ||
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.licenses[0]?.status === "PENDING")
      .length,
    approved: applications.filter(
      (app) => app.licenses[0]?.status === "APPROVED"
    ).length,
    rejected: applications.filter(
      (app) => app.licenses[0]?.status === "REJECTED"
    ).length,
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
            Vendor Applications
          </h1>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Review and manage vendor license applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterStatus("all")}
          >
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
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterStatus("pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Pending Review
                </p>
                <p className={`text-3xl font-bold mt-1 text-yellow-600`}>
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl">
                ⏳
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterStatus("approved")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Approved
                </p>
                <p className={`text-3xl font-bold mt-1 text-green-600`}>
                  {stats.approved}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setFilterStatus("rejected")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Rejected
                </p>
                <p className={`text-3xl font-bold mt-1 text-red-600`}>
                  {stats.rejected}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">
                ❌
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <p
              className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Filter:
            </p>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3
                className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                No Applications Found
              </h3>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                No applications match the selected filter
              </p>
            </Card>
          ) : (
            filteredApplications.map((app) => {
              const latestLicense = app.licenses[0];
              const status = latestLicense?.status || "NO LICENSE";

              return (
                <Card key={app.id} className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {app.businessName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Applicant
                          </p>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {app.user.name}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {app.user.email}
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
                            {app.stationName}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {app.city}, {app.state}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Type
                          </p>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {app.stallType}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Applied:{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {latestLicense && (
                        <div
                          className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
                        >
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            License Number:{" "}
                            <span
                              className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {latestLicense.licenseNumber}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {status === "PENDING" && (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowApprovalModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowRejectionModal(true);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="secondary">View Details</Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3
              className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Approve Application
            </h3>
            <p
              className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Are you sure you want to approve the application for{" "}
              <strong>{selectedApplication.businessName}</strong>? A license
              will be generated and the vendor will be notified.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirm Approval
              </Button>
              <Button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedApplication(null);
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3
              className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Reject Application
            </h3>
            <p
              className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Provide a reason for rejecting{" "}
              <strong>{selectedApplication.businessName}</strong>&apos;s
              application:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter detailed reason for rejection..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border mb-6 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
              required
            />
            <div className="flex gap-4">
              <Button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Confirm Rejection
              </Button>
              <Button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedApplication(null);
                  setRejectionReason("");
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
