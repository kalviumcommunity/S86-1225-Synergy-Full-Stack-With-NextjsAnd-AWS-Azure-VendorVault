// Loading skeleton for admin pages
export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header with Title and Actions */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
      </div>

      {/* Filter/Search Bar Skeleton */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
      </div>

      {/* Data Table Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(8)].map((_, rowI) => (
          <div
            key={rowI}
            className="border-b border-gray-200 dark:border-gray-700 p-4 flex gap-4 animate-pulse last:border-0"
          >
            {[...Array(6)].map((_, colI) => (
              <div
                key={colI}
                className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
