import * as React from "react";
import * as Progress from "@radix-ui/react-progress";

export function Loader({
  isLoading,
  label = "Loading...",
  fullScreen = true,
}: {
  isLoading: boolean;
  label?: string;
  fullScreen?: boolean;
}) {
  if (!isLoading) return null;

  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <svg
        className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-brand mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
      <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
        {label}
      </span>
      <Progress.Root
        className="w-40 sm:w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
        value={100}
      >
        <Progress.Indicator
          className="bg-brand h-2 rounded-full animate-pulse"
          style={{ width: "100%" }}
        />
      </Progress.Root>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}
