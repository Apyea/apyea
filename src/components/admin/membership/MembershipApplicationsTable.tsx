"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SecondaryButton } from "@/components/ui/form-primitives";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { formatMembershipStatus } from "@/lib/membership/admin-actions";

type ApplicationRow = {
  id: string;
  applicationReference: string;
  fullName: string;
  email: string;
  mobile: string;
  applicationStatus: string;
  paymentStatus: string;
  submittedAt: string;
  member?: { membershipNumber: string } | null;
};

export function MembershipApplicationsTable() {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (appliedQ) params.set("q", appliedQ);
    const res = await fetch(`/api/admin/membership/applications?${params}`);
    const data = await res.json();
    setRows(data.items ?? []);
    setLoading(false);
  }, [appliedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-2xl bg-white p-4 ring-1 ring-[#1E2E24]/8">
        <input
          className="flex-1 rounded-lg border border-[#1E2E24]/12 px-3 py-2 text-sm"
          placeholder="Search reference, name, email, payment ref…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setAppliedQ(q.trim()), void load())}
        />
        <SecondaryButton type="button" onClick={() => setAppliedQ(q.trim())}>
          Search
        </SecondaryButton>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#1E2E24]/8">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#FAF7F2] text-xs uppercase text-[#5F7A66]">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2E24]/6">
            {loading ? <TableSkeletonRows columns={6} rows={8} /> : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#5F7A66]">
                  No applications found.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium">{row.applicationReference}</td>
                <td className="px-4 py-3">{row.fullName}</td>
                <td className="px-4 py-3 text-xs">{formatMembershipStatus(row.applicationStatus)}</td>
                <td className="px-4 py-3 text-xs">{formatMembershipStatus(row.paymentStatus)}</td>
                <td className="px-4 py-3 text-xs">{row.member?.membershipNumber ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/membership/applications/${row.id}`}
                    className="inline-flex rounded-full bg-[#2F4F3A] px-4 py-1.5 text-xs font-semibold text-white"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
