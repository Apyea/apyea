"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { parseResponseJson } from "@/lib/auth/parse-response-json";
import { formatEventRegistrationStatus } from "@/lib/events/admin-actions";
import { SecondaryButton, SelectField, TextField } from "@/components/ui/form-primitives";
import { TableSkeletonRows } from "@/components/ui/skeleton";

type Row = {
  id: string;
  registrationReference: string;
  fullName: string;
  email: string;
  registrationStatus: string;
  paymentStatus: string;
  submittedAt: string;
  event: { id: string; title: string };
  member: { membershipNumber: string } | null;
};

export function EventRegistrationsTable({ initialEventId }: { initialEventId?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [eventId, setEventId] = useState(initialEventId ?? "");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await adminFetch("/api/admin/events");
        const data = await parseResponseJson<{ events?: { id: string; title: string }[]; error?: string }>(
          res,
        );
        if (!res.ok) throw new Error(data.error ?? "Failed to load events");
        setEvents(data.events ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load events");
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (eventId) params.set("eventId", eventId);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);
      const res = await adminFetch(`/api/admin/events/registrations?${params}`);
      const data = await parseResponseJson<{ registrations?: Row[]; error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Failed to load registrations");
      setRows(data.registrations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load registrations");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q, eventId, paymentFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#1E2E24]/8">
        <TextField
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Reference, name, payment ref…"
          className="min-w-[12rem] flex-1"
        />
        <SelectField label="Event" value={eventId} onChange={setEventId} className="sm:w-48">
          <option value="">All events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Payment"
          value={paymentFilter}
          onChange={setPaymentFilter}
          className="sm:w-40"
        >
          <option value="">Any</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </SelectField>
        <SecondaryButton type="button" className="self-end sm:w-auto" onClick={() => void load()}>
          Apply
        </SecondaryButton>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#1E2E24]/8">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#FAF7F2] text-xs uppercase text-[#5F7A66]">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2E24]/6">
            {loading ? <TableSkeletonRows columns={6} rows={8} /> : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#5F7A66]">
                  No registrations found.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium">{row.registrationReference}</td>
                <td className="px-4 py-3 text-xs">{row.event.title}</td>
                <td className="px-4 py-3">{row.fullName}</td>
                <td className="px-4 py-3 text-xs">
                  {formatEventRegistrationStatus(row.registrationStatus)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatEventRegistrationStatus(row.paymentStatus)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/events/registrations/${row.id}`}
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