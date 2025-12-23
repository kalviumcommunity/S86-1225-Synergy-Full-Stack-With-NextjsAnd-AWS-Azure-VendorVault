"use client";
import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useUI } from "@/hooks/useUI";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isDarkMode } = useUI();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Hide sidebar on certain pages
  const hideSidebar =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname.startsWith("/verify");

  // Use neutral classes during SSR to prevent hydration mismatch
  const darkModeClass = mounted && isDarkMode;

  return (
    <div
      className={`flex flex-col h-screen ${darkModeClass ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!hideSidebar && <Sidebar />}
        <main
          className={`flex-1 overflow-auto ${darkModeClass ? "bg-gray-900" : "bg-gray-50"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
