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
}

export function Modal({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md focus:outline-none"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <Dialog.Title id="modal-title" className="text-lg font-bold mb-2">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mb-4">
              {description}
            </Dialog.Description>
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onConfirm}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              {cancelText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
