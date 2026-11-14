import type { ReactNode } from "react";
import { PublicSiteChrome } from "@/components/team/PublicSiteChrome";

/** Public marketing nav + padded main area for multi-step / long forms. */
export function PublicFormPage({
  children,
  maxWidthClass = "max-w-3xl",
  headerActions,
}: {
  children: ReactNode;
  maxWidthClass?: string;
  headerActions?: ReactNode;
}) {
  return (
    <PublicSiteChrome headerActions={headerActions}>
      <div className="py-8">
        <div className={`mx-auto w-full px-4 ${maxWidthClass}`}>{children}</div>
      </div>
    </PublicSiteChrome>
  );
}