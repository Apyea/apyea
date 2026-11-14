import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      aria-hidden
    />
  );
}

export function TableSkeletonRows({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} className="border-b border-zinc-100">
          {Array.from({ length: columns }, (__, col) => (
            <td key={col} className="px-4 py-3">
              <Skeleton
                className={`h-4 ${col === 0 ? "w-28" : col === columns - 1 ? "ml-auto w-16" : "w-full max-w-[7rem]"}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function FinanceTablePageSkeleton({ columns = 8 }: { columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-16 w-full sm:w-56" />
          <Skeleton className="h-16 w-40" />
          <Skeleton className="h-16 w-44" />
        </div>
        <Skeleton className="h-10 w-full sm:w-28" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full">
          <thead className="border-b bg-zinc-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableSkeletonRows columns={columns} rows={7} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FinanceDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-14 w-36" />
        <Skeleton className="h-14 w-36" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-2xl lg:col-span-1" />
        <Skeleton className="h-48 rounded-2xl lg:col-span-1" />
        <Skeleton className="h-40 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}

export function AdminTablePageSkeleton({
  filterFields = 2,
  columns = 6,
}: {
  filterFields?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-[#1E2E24]/8">
        <FilterBarSkeleton count={filterFields} />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#1E2E24]/8">
        <table className="min-w-full">
          <thead className="border-b bg-[#FAF7F2]">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableSkeletonRows columns={columns} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterBarSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Skeleton className="h-10 min-w-0 flex-1" />
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-32" />
      ))}
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

export function SurveysTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md rounded-2xl" />
      <div className="rounded-2xl bg-white p-4 ring-1 ring-[#1E2E24]/8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
      <AdminTablePageSkeleton filterFields={0} columns={6} />
    </div>
  );
}

export function DetailReviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-[#1E2E24]/8">
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12 sm:col-span-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MasterDataSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export function CatalogPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
    </div>
  );
}

export function MemberDashboardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#1E2E24]/8">
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-56" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#1E2E24]/8 sm:p-8">
      <Skeleton className="mb-2 h-7 w-40" />
      <Skeleton className="mb-6 h-4 w-full max-w-xs" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="mt-2 h-11 w-full rounded-full" />
      </div>
    </div>
  );
}

export function AdminShellSkeleton({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-50">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:block">
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="space-y-5 p-3 pt-4">
          {Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className="space-y-2">
              <Skeleton className="mx-2 h-2 w-16" />
              {Array.from({ length: 3 }).map((__, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-end gap-3 border-b border-zinc-200 bg-white px-4">
          <Skeleton className="hidden h-8 w-32 sm:block" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <main className="flex-1 p-4 sm:p-6">{children ?? <Skeleton className="h-64 w-full rounded-2xl" />}</main>
      </div>
    </div>
  );
}
