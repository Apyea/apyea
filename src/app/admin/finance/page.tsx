import { Suspense } from "react";
import { FinanceSummaryDashboard } from "@/components/admin/finance/FinanceSummaryDashboard";
import { FinanceDashboardSkeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminFinancePage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-medium text-zinc-950">Finance summary</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Verified income and approved expenditure for the selected period (cash-basis).
        </p>
      </div>
      <Suspense fallback={<FinanceDashboardSkeleton />}>
        <FinanceSummaryDashboard />
      </Suspense>
    </div>
  );
}
