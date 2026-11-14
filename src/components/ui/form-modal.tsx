"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
  closeDisabled = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
  closeDisabled?: boolean;
}) {
  function handleClose() {
    if (closeDisabled) return;
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-[#1E2E24]/40 backdrop-blur-[1px]" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <DialogPanel
          transition
          className={`flex max-h-[min(100dvh,720px)] w-full flex-col rounded-t-2xl bg-white shadow-[0px_0px_20px_0px_rgba(9,9,11,0.15)] ring-1 ring-[rgba(9,9,11,0.05)] transition data-[closed]:translate-y-4 data-[closed]:opacity-0 sm:max-h-[90vh] sm:rounded-2xl ${
            wide ? "max-w-3xl" : "max-w-2xl"
          }`}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold tracking-tight text-[#1B3D32]">
                {title}
              </DialogTitle>
              {description ? (
                <p className="mt-1 text-sm text-[#5F7A66]">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
              aria-label="Close"
              disabled={closeDisabled}
              onClick={handleClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
