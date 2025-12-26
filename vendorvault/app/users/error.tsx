"use client";

export default function UsersError({
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg
              className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to Load Users
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message ||
            "Could not fetch user data. This might be a temporary issue."}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
