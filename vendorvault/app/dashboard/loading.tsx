// Loading skeleton for dashboard page
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section Skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg animate-pulse"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="flex-1 h-8 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
