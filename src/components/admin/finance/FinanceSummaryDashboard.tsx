"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { FinanceSummary } from "@/lib/finance/summary";
import {
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/finance/labels";
import { FinanceDashboardSkeleton } from "@/components/ui/skeleton";

function inr(n: number) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

export function FinanceSummaryDashboard() {
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  const [from, setFrom] = useState(monthStart.toISOString().slice(0, 10));
  const [to, setTo] = useState(monthEnd.toISOString().slice(0, 10));
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/finance/summary?from=${from}&to=${to}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.hint ? `${data.error}. ${data.hint}` : (data.error ?? "Failed to load"));
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          From
          <input
            type="date"
            className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          To
          <input
            type="date"
            className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      {loading && !summary ? <FinanceDashboardSkeleton /> : null}

      {summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase text-zinc-500">Income (verified)</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{inr(summary.income.total)}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase text-zinc-500">Expenditure (approved)</p>
              <p className="mt-1 text-2xl font-semibold text-amber-800">{inr(summary.expenditure.total)}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase text-zinc-500">Net</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900">{inr(summary.net)}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h2 className="font-medium text-zinc-900">Income by category</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {Object.entries(summary.income.byCategory).map(([key, val]) => (
                  <li key={key} className="flex justify-between gap-4">
                    <span>{PAYMENT_CATEGORY_LABELS[key as keyof typeof PAYMENT_CATEGORY_LABELS]}</span>
                    <span className="font-medium">{inr(val)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h2 className="font-medium text-zinc-900">Income by payment method</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {Object.entries(summary.income.byMethod).map(([key, val]) => (
                  <li key={key} className="flex justify-between gap-4">
                    <span>{PAYMENT_METHOD_LABELS[key as keyof typeof PAYMENT_METHOD_LABELS]}</span>
                    <span className="font-medium">{inr(val)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 lg:col-span-2">
              <h2 className="font-medium text-zinc-900">Expenditure by category</h2>
              <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {Object.entries(summary.expenditure.byCategory).map(([key, val]) => (
                  <li key={key} className="flex justify-between gap-4 rounded-lg bg-zinc-50 px-3 py-2">
                    <span>{EXPENSE_CATEGORY_LABELS[key as keyof typeof EXPENSE_CATEGORY_LABELS]}</span>
                    <span className="font-medium">{inr(val)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
