"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { PrimaryButton, TextField } from "@/components/ui/form-primitives";

type RenewalRow = {
  id: string;
  renewalReference: string;
  paymentStatus: string;
  renewalStatus: string;
  member: { membershipNumber: string; fullName: string };
};

export function RenewalsManager() {
  const [renewals, setRenewals] = useState<RenewalRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    memberId: "",
    paymentReference: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    renewalFee: "",
    paymentMethod: "ONLINE",
  });

  const load = useCallback(async () => {
    const res = await adminFetch("/api/admin/membership/renewals");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Load failed");
    setRenewals(data.renewals ?? []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await adminFetch("/api/admin/membership/renewals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, renewalFee: Number(form.renewalFee) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    await load();
  }

  async function action(id: string, act: string) {
    const res = await adminFetch(`/api/admin/membership/renewals/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Action failed");
    else await load();
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <form onSubmit={submit} className="grid max-w-xl gap-3 rounded-2xl border bg-white p-4">
        <p className="text-sm font-medium">Record renewal application</p>
        <TextField label="Member ID" required value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} />
        <TextField label="Payment reference" required value={form.paymentReference} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} />
        <TextField label="Payment date" type="date" required value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
        <TextField label="Renewal fee" required value={form.renewalFee} onChange={(e) => setForm({ ...form, renewalFee: e.target.value })} />
        <PrimaryButton type="submit">Submit</PrimaryButton>
      </form>

      <ul className="divide-y rounded-2xl border bg-white text-sm">
        {renewals.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <span className="font-mono text-xs">{r.renewalReference}</span>
              <span className="mx-2">·</span>
              {r.member.membershipNumber} — {r.member.fullName}
              <span className="ml-2 text-xs text-zinc-500">
                pay {r.paymentStatus} / {r.renewalStatus}
              </span>
            </div>
            <span className="flex gap-2">
              {r.paymentStatus !== "VERIFIED" ? (
                <button type="button" className="text-emerald-700" onClick={() => void action(r.id, "verify_payment")}>
                  Verify payment
                </button>
              ) : null}
              {r.paymentStatus === "VERIFIED" && r.renewalStatus !== "APPROVED" ? (
                <button type="button" className="text-emerald-700" onClick={() => void action(r.id, "approve")}>
                  Approve renewal
                </button>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
