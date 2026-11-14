"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { APYEA_LOGO_ALT, APYEA_LOGO_SRC } from "@/lib/brand";
import { PUBLIC_SITE_NAV } from "@/lib/public-navigation";

function navLinkClass(active: boolean) {
  return `rounded-full px-3.5 py-2 text-sm font-medium transition ${
    active
      ? "bg-[#E8EFE9] text-[#1B3D32]"
      : "text-[#3D5244] hover:bg-[#E8EFE9] hover:text-[#1E2E24]"
  }`;
}

export function PublicSiteHeader({ headerActions }: { headerActions?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
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
            {PUBLIC_SITE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(isActive(item.href))}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {headerActions}
          </div>

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
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <XMarkIcon className="size-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-2" aria-label="Main">
              {PUBLIC_SITE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-base font-medium ${isActive(item.href) ? "bg-[#E8EFE9]" : ""}`}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {headerActions ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-[#1E2E24]/10 pt-4 [&_a]:text-center">
                {headerActions}
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}