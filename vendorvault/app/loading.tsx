// Root loading skeleton - shown during page transitions
export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-gray-200 dark:bg-gray-700"></div>

      {/* Main Content Skeleton */}
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-64 bg-gray-100 dark:bg-gray-800 p-6 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2 mt-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-6 space-y-6">
          {/* Title Skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

          {/* Content Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg space-y-4"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
