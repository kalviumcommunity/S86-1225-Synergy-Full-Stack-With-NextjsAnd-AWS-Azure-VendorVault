import * as React from "react";
import * as Progress from "@radix-ui/react-progress";

export function Loader({
  isLoading,
  label = "Loading...",
}: {
  isLoading: boolean;
  label?: string;
}) {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center"
      >
        <svg
          className="animate-spin h-8 w-8 text-blue-600 mb-2"
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
        <span>{label}</span>
        <Progress.Root
          className="w-40 h-2 bg-gray-200 rounded mt-2"
          value={100}
        >
          <Progress.Indicator
            className="bg-blue-600 h-2 rounded"
            style={{ width: "100%" }}
          />
        </Progress.Root>
      </div>
    </div>
  );
}
