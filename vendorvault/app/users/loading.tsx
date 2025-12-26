// Loading skeleton for users page
export default function UsersLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>

      {/* Users Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {[...Array(5)].map((_, i) => (
                <th key={i} className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowI) => (
              <tr
                key={rowI}
                className="border-b border-gray-200 dark:border-gray-700 animate-pulse"
              >
                {[...Array(5)].map((_, colI) => (
                  <td key={colI} className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2 mt-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-10"
          ></div>
        ))}
      </div>
    </div>
  );
}
