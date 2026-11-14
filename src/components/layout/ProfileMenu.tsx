"use client";

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

function displayName(email: string, name: string | null | undefined) {
  if (name?.trim()) return name.trim();
  return email.split("@")[0] ?? email;
}

function initials(email: string, name: string | null | undefined) {
  const base = displayName(email, name);
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

export function ProfileMenu({
  email,
  name,
  subtitle,
  onSignOut,
}: {
  email: string;
  name?: string | null;
  subtitle?: string;
  onSignOut: () => void;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="hidden min-w-0 text-right sm:block">
        <p className="truncate text-sm font-medium text-zinc-900">
          {displayName(email, name)}
        </p>
        {subtitle ? (
          <p className="truncate text-xs font-medium uppercase tracking-wide text-zinc-500">
            {subtitle}
          </p>
        ) : (
          <p className="truncate text-xs text-zinc-500">{email}</p>
        )}
      </div>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2F4F3A] text-xs font-semibold text-white"
        aria-hidden
      >
        {initials(email, name)}
      </span>
      <button
        type="button"
        onClick={onSignOut}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 sm:px-3 sm:text-sm"
      >
        <ArrowRightStartOnRectangleIcon className="h-4 w-4 sm:hidden" aria-hidden />
        <span className="hidden sm:inline">Logout</span>
        <span className="sr-only sm:hidden">Logout</span>
      </button>
    </div>
  );
}
