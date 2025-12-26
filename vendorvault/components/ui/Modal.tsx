import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function Modal({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ModalProps) {
  const confirmButtonStyles = {
    danger: "bg-error hover:bg-error-dark text-white",
    warning: "bg-warning hover:bg-warning-dark text-white",
    info: "bg-brand hover:bg-brand-dark text-white",
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 sm:mx-auto focus:outline-none focus:ring-2 focus:ring-brand animate-in"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <Dialog.Title
            id="modal-title"
            className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white"
          >
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {description}
            </Dialog.Description>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`w-full sm:w-auto ${confirmButtonStyles[variant]} px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
