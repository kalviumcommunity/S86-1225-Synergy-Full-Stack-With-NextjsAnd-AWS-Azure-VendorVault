import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VendorVault - Vendor Management System",
  description: "Secure vendor management with file upload and authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="flex gap-6 p-4 bg-gray-100 border-b">
          <Link href="/" className="font-bold text-lg hover:text-blue-600">
            Home
          </Link>
          <Link href="/login" className="hover:text-blue-600">
            Login
          </Link>
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/users/1" className="hover:text-blue-600">
            User 1
          </Link>
          <Link href="/users/2" className="hover:text-blue-600">
            User 2
          </Link>
        </nav>
        {children}
        <footer className="bg-gray-100 p-4 text-center mt-12 border-t">
          <p>&copy; 2025 VendorVault. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
