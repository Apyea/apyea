import type { ReactNode } from "react";
import { AppTopBar } from "@/components/layout/AppTopBar";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAF7F2]">
      <AppTopBar />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:py-12">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#1E2E24]/8 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight text-[#1B3D32]">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-[#5F7A66]">{subtitle}</p> : null}
          <div className="mt-6 space-y-4">{children}</div>
        </div>
        {footer ? (
          <div className="mt-6 text-center text-sm text-[#5F7A66]">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
