import { Suspense } from "react";
import { ExpensesManager } from "@/components/admin/finance/ExpensesManager";
import { FinanceTablePageSkeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminFinanceExpensesPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-zinc-950">Expenditure vouchers</h2>
      <p className="text-sm text-zinc-600">Rent, cloud, programs, stationery, and administrative costs.</p>
      <Suspense fallback={<FinanceTablePageSkeleton columns={8} />}>
        <ExpensesManager />
      </Suspense>
    </div>
  );
}
