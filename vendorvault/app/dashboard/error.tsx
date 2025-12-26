"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[600px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30">
            <svg
              className="h-8 w-8 text-orange-600 dark:text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || "Unable to load dashboard data. Please try again."}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Reload Dashboard
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
