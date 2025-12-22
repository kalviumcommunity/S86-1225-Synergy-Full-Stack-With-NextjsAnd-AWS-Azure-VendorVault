import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-4xl font-bold mb-4">Welcome to VendorVault 🚀</h1>
      <p className="text-lg text-gray-600 mb-8">
        A complete vendor management system with secure routing and
        authentication.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Link
          href="/login"
          className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
        >
          <h2 className="text-xl font-bold">Login</h2>
          <p>Access your account</p>
        </Link>

        <Link
          href="/dashboard"
          className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
        >
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p>View your profile (protected)</p>
        </Link>

        <Link
          href="/users/1"
          className="p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center"
        >
          <h2 className="text-xl font-bold">User Profiles</h2>
          <p>Dynamic routes example</p>
        </Link>

        <div className="p-6 bg-gray-400 text-white rounded-lg text-center">
          <h2 className="text-xl font-bold">Route Map</h2>
          <p>Public & protected routes</p>
        </div>
      </div>

      <div className="mt-12 max-w-2xl">
        <h3 className="text-2xl font-bold mb-4">Route Structure</h3>
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <p className="font-bold text-green-600">Public Routes:</p>
          <ul className="ml-4 mb-4">
            <li>/ - Home page</li>
            <li>/login - Login page</li>
          </ul>
          <p className="font-bold text-red-600">Protected Routes:</p>
          <ul className="ml-4">
            <li>/dashboard - User dashboard</li>
            <li>/users/[id] - Dynamic user profiles</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
