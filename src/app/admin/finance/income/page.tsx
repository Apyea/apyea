import { Suspense } from "react";
import { ManualIncomeForm } from "@/components/admin/finance/ManualIncomeForm";
import { FinanceTablePageSkeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminFinanceIncomePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-zinc-950">Manual income</h2>
      <p className="text-sm text-zinc-600">
        Donations, program and event fees, and subscriptions (membership fees are recorded on payment
        verification).
      </p>
      <Suspense fallback={<FinanceTablePageSkeleton columns={7} />}>
        <ManualIncomeForm />
      </Suspense>
    </div>
  );
}
