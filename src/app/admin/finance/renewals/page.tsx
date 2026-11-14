import { Suspense } from "react";
import { RenewalsManager } from "@/components/admin/finance/RenewalsManager";
import { FinanceTablePageSkeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminFinanceRenewalsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-zinc-950">Membership renewals</h2>
      <Suspense fallback={<FinanceTablePageSkeleton columns={5} />}>
        <RenewalsManager />
      </Suspense>
    </div>
  );
}
