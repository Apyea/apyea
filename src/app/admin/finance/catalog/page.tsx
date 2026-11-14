import { Suspense } from "react";
import { CatalogManager } from "@/components/admin/finance/CatalogManager";
import { CatalogPageSkeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminFinanceCatalogPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-zinc-950">Programs, events & plans</h2>
      <Suspense fallback={<CatalogPageSkeleton />}>
        <CatalogManager />
      </Suspense>
    </div>
  );
}
