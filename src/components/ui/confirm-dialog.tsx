"use client";

import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { SecondaryButton } from "@/components/ui/form-primitives";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  tone?: "danger" | "default";
};

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  tone = "default",
}: ConfirmDialogProps) {
  function handleClose() {
    if (loading) return;
    onClose();
  }

  const confirmClass =
    tone === "danger"
      ? "inline-flex w-full items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      : "inline-flex w-full items-center justify-center rounded-full bg-[#2F4F3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B3D32] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-[#1E2E24]/40 backdrop-blur-[1px]" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0px_0px_20px_0px_rgba(9,9,11,0.15)] ring-1 ring-[rgba(9,9,11,0.05)] transition data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-lg font-semibold tracking-tight text-[#1B3D32]">
            {title}
          </DialogTitle>
          <Description as="div" className="mt-2 text-sm leading-relaxed text-[#5F7A66]">
            {description}
          </Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <SecondaryButton
              type="button"
              disabled={loading}
              className="sm:w-auto"
              onClick={handleClose}
            >
              {cancelLabel}
            </SecondaryButton>
            <button type="button" disabled={loading} className={confirmClass} onClick={() => void onConfirm()}>
              {loading ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
