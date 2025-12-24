import * as React from "react";
import { Toast, Toaster, toast } from "react-hot-toast";

export function showToast(
  type: "success" | "error" | "loading",
  message: string
) {
  if (type === "success") toast.success(message);
  else if (type === "error") toast.error(message);
  else toast.loading(message);
}

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        ariaProps: { role: "status", "aria-live": "polite" },
      }}
    />
  );
}
