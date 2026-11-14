"use client";

import type { ReactNode } from "react";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";

export function PublicSiteChrome({
  children,
  headerActions,
}: {
  children: React.ReactNode;
  headerActions?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E2E24]">
      <PublicSiteHeader headerActions={headerActions} />
      <main>{children}</main>
    </div>
  );
}