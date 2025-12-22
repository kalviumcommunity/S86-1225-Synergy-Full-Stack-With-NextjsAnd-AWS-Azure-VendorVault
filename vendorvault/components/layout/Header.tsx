"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <Link
        href="/"
        className="font-bold text-xl hover:text-blue-100 transition"
      >
        VendorVault
      </Link>
      <nav className="flex gap-6">
        <Link href="/" className="hover:text-blue-100 transition">
          Home
        </Link>
        <Link href="/dashboard" className="hover:text-blue-100 transition">
          Dashboard
        </Link>
        <Link href="/users/1" className="hover:text-blue-100 transition">
          Users
        </Link>
        <Link href="/login" className="hover:text-blue-100 transition">
          Login
        </Link>
      </nav>
    </header>
  );
}
