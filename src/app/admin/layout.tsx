import { Suspense } from "react";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminShellSkeleton, AdminTablePageSkeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <AdminShellSkeleton>
          <AdminTablePageSkeleton columns={5} />
        </AdminShellSkeleton>
      }
    >
      <AdminAuthGate>{children}</AdminAuthGate>
    </Suspense>
  );
}
