"use client";
import Link from "next/link";

export default function Sidebar() {
  const links = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/users/1", label: "Users", icon: "👥" },
    { href: "/login", label: "Login", icon: "🔐" },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Navigation</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
