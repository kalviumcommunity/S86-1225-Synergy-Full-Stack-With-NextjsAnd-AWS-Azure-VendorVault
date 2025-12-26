// Loading skeleton for auth pages
export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg space-y-6">
          {/* Logo/Title Skeleton */}
          <div className="text-center space-y-2 mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}

            {/* Remember/Forgot Link Skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-6"></div>
          </div>

          {/* Divider & Social Skeleton */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500"></span>
            </div>
          </div>

          {/* Signup/Footer Link Skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
