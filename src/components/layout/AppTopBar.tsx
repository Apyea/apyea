"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { APP_NAVBAR_HEIGHT_CLASS, ApyeaBrand } from "@/components/layout/ApyeaBrand";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

export function AppTopBar({
  onMenuClick,
  showMenuButton = false,
  menuLabel = "Open navigation",
  user,
  profileSubtitle,
  onSignOut,
  trailing,
  showLogo = true,
}: {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  menuLabel?: string;
  user?: { email: string; name?: string | null };
  profileSubtitle?: string;
  onSignOut?: () => void;
  /** Extra controls shown before logo (e.g. public nav). */
  trailing?: ReactNode;
  /** Hide brand on admin (logo lives in sidenav). */
  showLogo?: boolean;
}) {
  return (
    <header
      className={`sticky top-0 z-40 flex ${APP_NAVBAR_HEIGHT_CLASS} w-full shrink-0 items-center border-b border-zinc-200 bg-white`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 pl-3 sm:pl-4">
        {showMenuButton ? (
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
            aria-label={menuLabel}
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-5 sm:pr-6">
        {trailing}
        {showLogo ? <ApyeaBrand layout="bar" className="pr-1" /> : null}
        {user && onSignOut ? (
          <ProfileMenu
            email={user.email}
            name={user.name}
            subtitle={profileSubtitle}
            onSignOut={onSignOut}
          />
        ) : null}
      </div>
    </header>
  );
}
