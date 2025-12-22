import type { Metadata } from "next";
import { LayoutWrapper } from "@/components";
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
      <body className="m-0 p-0">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
