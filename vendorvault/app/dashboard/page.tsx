"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useUI();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Role-based redirects
    if (user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (user?.role === "VENDOR") {
      router.push("/vendor/dashboard");
    } else if (user?.role === "INSPECTOR") {
      router.push("/inspector/dashboard");
    }
  }, [isAuthenticated, user, router]);

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-2xl w-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </main>
  );
}
