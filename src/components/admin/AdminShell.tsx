"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { UserRole } from "@prisma/client";
import {
  ArrowPathIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ReceiptPercentIcon,
  TableCellsIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { APP_NAVBAR_HEIGHT_CLASS, ApyeaBrand } from "@/components/layout/ApyeaBrand";
import { AppMain } from "@/components/layout/AppMain";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { navForRole, type AdminIconName, type AdminNavItem } from "@/lib/admin/navigation";

const ICONS: Record<AdminIconName, ComponentType<{ className?: string }>> = {
  home: HomeIcon,
  users: UserGroupIcon,
  clipboard: ClipboardDocumentListIcon,
  table: TableCellsIcon,
  chart: ChartBarIcon,
  banknotes: BanknotesIcon,
  receipt: ReceiptPercentIcon,
  building: BuildingOffice2Icon,
  calendar: ClipboardDocumentListIcon,
  "arrow-path": ArrowPathIcon,
};

function isActive(pathname: string, item: AdminNavItem) {
  if (item.matchPrefix) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  if (item.href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === item.href;
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: AdminNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[item.icon];
  const active = isActive(pathname, item);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-[#2F4F3A] text-white shadow-sm"
          : "text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarNav({
  role,
  pathname,
  onNavigate,
}: {
  role: UserRole;
  pathname: string;
  onNavigate?: () => void;
}) {
  const categories = useMemo(() => navForRole(role), [role]);

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4" aria-label="Admin">
      {categories.map((category) => (
        <div key={category.id}>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {category.label}
          </p>
          <ul className="space-y-0.5">
            {category.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} pathname={pathname} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({
  role,
  email,
  name,
  children,
}: {
  role: UserRole;
  email: string;
  name?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/login?redirect=/admin");
    router.refresh();
  }

  const roleLabel = role.replace(/_/g, " ").toUpperCase();

  const sidebarFooter = (
    <div className="border-t border-zinc-200 p-2">
      <Link
        href="/"
        className="block rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
      >
        Public site
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-zinc-50">
      {/* Desktop sidenav — flush to viewport left */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <SidebarTop />
        <SidebarNav role={role} pathname={pathname} />
        {sidebarFooter}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,17rem)] flex-col bg-white shadow-xl">
            <div
              className={`flex ${APP_NAVBAR_HEIGHT_CLASS} shrink-0 items-center justify-between border-b border-zinc-200 px-3`}
            >
              <ApyeaBrand href="/admin" layout="bar" showWordmark />
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-600"
                onClick={() => setMobileOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <SidebarNav
              role={role}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            {sidebarFooter}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar
          showMenuButton
          showLogo={false}
          onMenuClick={() => setMobileOpen(true)}
          user={{ email, name }}
          profileSubtitle={roleLabel}
          onSignOut={() => void signOut()}
        />
        <AppMain width="full">{children}</AppMain>
      </div>
    </div>
  );
}

function SidebarTop() {
  return (
    <div
      className={`flex ${APP_NAVBAR_HEIGHT_CLASS} shrink-0 items-center border-b border-zinc-200 px-4`}
    >
      <ApyeaBrand href="/admin" layout="bar" showWordmark />
    </div>
  );
}
