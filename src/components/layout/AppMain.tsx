import type { ReactNode } from "react";

/**
 * Constrains page content width while the shell stays full-bleed (sidenav flush left).
 */
export function AppMain({
  children,
  className = "",
  width = "wide",
}: {
  children: ReactNode;
  className?: string;
  width?: "wide" | "narrow" | "full";
}) {
  const max =
    width === "narrow"
      ? "max-w-2xl"
      : width === "full"
        ? "max-w-none"
        : "max-w-7xl";

  return (
    <main
      className={`min-w-0 flex-1 py-4 pr-4 pl-4 sm:py-6 sm:pr-8 sm:pl-6 ${className}`}
    >
      <div className={`mx-auto w-full ${max}`}>{children}</div>
    </main>
  );
}
