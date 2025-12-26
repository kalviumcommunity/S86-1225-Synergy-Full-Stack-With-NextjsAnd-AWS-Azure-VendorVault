"use client";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message ||
              "An error occurred during authentication. Please try again."}
          </p>

          <div className="flex gap-3 flex-col">
            <button
              onClick={() => reset()}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
