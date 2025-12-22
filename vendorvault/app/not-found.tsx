import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center mt-20">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>

        <div className="bg-red-50 p-4 rounded-lg mb-8">
          <p className="text-sm text-red-900">
            Make sure the URL is correct. Check the route structure below.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Home
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
          <p className="font-bold text-gray-900 mb-2">Available Routes:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ / - Home</li>
            <li>✓ /login - Login Page</li>
            <li>✓ /dashboard - Dashboard (Protected)</li>
            <li>✓ /users/1 - User 1</li>
            <li>✓ /users/2 - User 2</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
