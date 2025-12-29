"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode } = useUI();

  return (
    <main
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}
    >
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VendorVault
            </span>
          </h1>
          <p
            className={`text-xl md:text-2xl mb-8 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Railway Vendor License Management System
          </p>
          <p
            className={`text-lg max-w-2xl mx-auto ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Streamline your vendor management with secure authentication,
            license tracking, and comprehensive admin tools.
          </p>
        </div>

        {/* Quick Actions */}
        {isAuthenticated && (
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-12 text-white text-center shadow-xl"
            suppressHydrationWarning
          >
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.username}! 👋
            </h2>
            <p className="mb-4">
              You&apos;re logged in as{" "}
              <span className="font-semibold">{user?.role}</span>
            </p>
            <Link
              href={
                user?.role === "admin"
                  ? "/admin/dashboard"
                  : user?.role === "vendor"
                    ? "/vendor/dashboard"
                    : "/dashboard"
              }
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link
            href="/auth/login"
            className={`group p-8 rounded-2xl transition transform hover:scale-105 hover:shadow-xl ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Login
              </h2>
            </div>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Access your account and manage your vendor applications
            </p>
            <div className="mt-4 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition inline-block">
              Sign in →
            </div>
          </Link>

          <Link
            href="/auth/register"
            className={`group p-8 rounded-2xl transition transform hover:scale-105 hover:shadow-xl ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Register
              </h2>
            </div>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Create a new vendor account and start your application process
            </p>
            <div className="mt-4 text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition inline-block">
              Sign up →
            </div>
          </Link>

          <Link
            href="/verify/test"
            className={`group p-8 rounded-2xl transition transform hover:scale-105 hover:shadow-xl ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Verify License
              </h2>
            </div>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Verify vendor licenses using QR code or license number
            </p>
            <div className="mt-4 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition inline-block">
              Verify →
            </div>
          </Link>

          <Link
            href="/context-demo"
            className={`group p-8 rounded-2xl transition transform hover:scale-105 hover:shadow-xl ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg mr-4">
                <svg
                  className="w-8 h-8 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Demo
              </h2>
            </div>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Explore state management with Context API and custom hooks
            </p>
            <div className="mt-4 text-orange-600 dark:text-orange-400 font-semibold group-hover:translate-x-2 transition inline-block">
              Explore →
            </div>
          </Link>

          <div
            className={`p-8 rounded-2xl ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg mr-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Secure
              </h2>
            </div>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              JWT authentication, role-based access control, and encrypted data
            </p>
          </div>

          <div
            className={`p-8 rounded-2xl ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg mr-4">
                <svg
                  className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Fast
              </h2>
            </div>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Optimized database queries with caching and indexed searches
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div
          className={`rounded-2xl p-8 mb-12 ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
        >
          <h3
            className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="bg-blue-500 text-white p-2 rounded-lg mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4
                  className={`font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  License Management
                </h4>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Complete workflow for vendor license applications, approvals,
                  and renewals
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 text-white p-2 rounded-lg mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4
                  className={`font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Document Upload
                </h4>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Secure file storage with support for AWS S3 and local storage
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 text-white p-2 rounded-lg mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4
                  className={`font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  QR Code Verification
                </h4>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Instant license verification using QR codes
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 text-white p-2 rounded-lg mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4
                  className={`font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Role-Based Access
                </h4>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Admin, Inspector, and Vendor roles with specific permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p
            className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}
          >
            Built with Next.js 15, TypeScript, Prisma, and Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  );
}
