"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { APYEA_LOGO_ALT, APYEA_LOGO_SRC } from "@/lib/brand";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/team", label: "Our Team" },
  { href: "/events", label: "Events" },
  { href: "/membership/apply", label: "Membership" },
  { href: "/survey", label: "Yoga Educators" },
  { href: "/login", label: "Sign in" },
] as const;

export function PublicSiteChrome({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E2E24]">
      <header className="sticky top-0 z-50 border-b border-[#1E2E24]/5 bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center">
              <Image
                src={APYEA_LOGO_SRC}
                alt={APYEA_LOGO_ALT}
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold tracking-tight">APYEA</span>
              <span className="block text-[11px] font-medium text-[#5F7A66]">
                Andhra Pradesh Yoga Educators Association
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-[#3D5244] transition hover:bg-[#E8EFE9]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="inline-flex rounded-full border border-[#1E2E24]/10 p-2.5 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="size-5" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#1E2E24]/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 w-full max-w-sm bg-[#FAF7F2] p-6 shadow-xl">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setMobileOpen(false)}>
                <XMarkIcon className="size-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-base font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <main>{children}</main>
    </div>
  );
}