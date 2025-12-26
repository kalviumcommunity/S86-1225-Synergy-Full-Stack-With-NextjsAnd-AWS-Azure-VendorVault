"use client";

export default function AdminError({
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <svg
              className="h-8 w-8 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Section Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message ||
            "An error occurred in the admin section. Please try again."}
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
            <p className="font-semibold mb-2">Error Details:</p>
            <pre className="whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Retry
          </button>
          <button
            onClick={() => (window.location.href = "/admin/dashboard")}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Admin Home
          </button>
        </div>
      </div>
    </div>
  );
}
