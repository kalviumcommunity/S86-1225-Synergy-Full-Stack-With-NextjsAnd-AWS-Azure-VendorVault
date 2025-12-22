"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Mock token (in real apps, get it from backend)
    Cookies.set("token", "mock.jwt.token");
    router.push("/dashboard");
  }

  return (
    <main className="flex flex-col items-center mt-20">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@vendor.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold mb-2">Demo Credentials:</p>
          <p className="text-sm">Email: demo@vendor.com</p>
          <p className="text-sm">Password: demo123</p>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          This is a mock login. Any credentials work for demo purposes.
        </p>
      </div>
    </main>
  );
}
