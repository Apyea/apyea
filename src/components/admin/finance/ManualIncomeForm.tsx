"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PaymentCategory, PaymentVerificationStatus } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/24/outline";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { PAYMENT_CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/finance/labels";
import { FormModal } from "@/components/ui/form-modal";
import { PrimaryButton, SecondaryButton, SelectField, TextField } from "@/components/ui/form-primitives";
import { TableSkeletonRows } from "@/components/ui/skeleton";

const MANUAL_CATEGORIES: PaymentCategory[] = [
  "DONATION",
  "PROGRAM_FEE",
  "EVENT_FEE",
  "SUBSCRIPTION_FEE",
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
];

type CatalogItem = { id: string; code: string; title: string };

type IncomeRow = {
  id: string;
  receiptNumber: string | null;
  paymentCategory: PaymentCategory;
  verificationStatus: PaymentVerificationStatus;
  paymentDate: string;
  name: string;
  mobile: string;
  amountPaid: string;
  paymentReference: string;
  paymentMethod: string;
};

function defaultIncomeForm() {
  return {
    paymentCategory: "DONATION" as PaymentCategory,
    name: "",
    mobile: "",
    address: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    needByDate: "",
    paymentReference: "",
    amountPaid: "",
    paymentMethod: "CASH",
    purposeOfRemittance: "",
    programId: "",
    eventId: "",
    subscriptionPlanId: "",
  };
}

export function ManualIncomeForm() {
  const [records, setRecords] = useState<IncomeRow[]>([]);
  const [programs, setPrograms] = useState<CatalogItem[]>([]);
  const [events, setEvents] = useState<CatalogItem[]>([]);
  const [plans, setPlans] = useState<CatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultIncomeForm);

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadCatalog = useCallback(async () => {
    const [p, e, s] = await Promise.all([
      adminFetch("/api/admin/finance/programs?active=1"),
      adminFetch("/api/admin/finance/events?active=1"),
      adminFetch("/api/admin/finance/subscription-plans?active=1"),
    ]);
    const pj = await p.json();
    const ej = await e.json();
    const sj = await s.json();
    setPrograms(pj.programs ?? []);
    setEvents(ej.events ?? []);
    setPlans(sj.plans ?? []);
  }, []);

  const load = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      const qs = params.toString();
      const res = await adminFetch(`/api/admin/finance/income${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Load failed");
      const rows = (data.records ?? []) as IncomeRow[];
      setRecords(rows.filter((r) => MANUAL_CATEGORIES.includes(r.paymentCategory)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setListLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        (r.receiptNumber ?? "").toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.paymentReference.toLowerCase().includes(q) ||
        r.mobile.includes(q),
    );
  }, [records, searchQuery]);

  function openModal() {
    setForm(defaultIncomeForm());
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saveLoading) return;
    setModalOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/finance/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amountPaid: Number(form.amountPaid),
          programId: form.programId || undefined,
          eventId: form.eventId || undefined,
          subscriptionPlanId:
            form.paymentCategory === "SUBSCRIPTION_FEE" && form.subscriptionPlanId
              ? form.subscriptionPlanId
              : undefined,
          needByDate: form.needByDate || undefined,
          paymentReference:
            form.paymentMethod === "CASH" && !form.paymentReference.trim()
              ? undefined
              : form.paymentReference,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaveLoading(false);
    }
  }

  async function verify(id: string, action: "verify" | "reject") {
    setError(null);
    const res = await adminFetch(`/api/admin/finance/income/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Action failed");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-4">
      {error && !modalOpen ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <TextField
            label="Search"
            placeholder="Receipt, payer, reference…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-56"
          />
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            className="sm:w-40"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Income type"
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="sm:w-44"
          >
            <option value="">All types</option>
            {MANUAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PAYMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </SelectField>
        </div>
        <PrimaryButton type="button" className="w-full sm:w-auto" onClick={openModal}>
          <span className="inline-flex items-center justify-center gap-2">
            <PlusIcon className="h-4 w-4" aria-hidden />
            Add new
          </span>
        </PrimaryButton>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Receipt</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Payer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <TableSkeletonRows columns={7} rows={7} />
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No income records match your filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.receiptNumber ?? "Pending approval"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(r.paymentDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">{PAYMENT_CATEGORY_LABELS[r.paymentCategory]}</td>
                  <td className="max-w-[10rem] truncate px-4 py-3" title={r.name}>
                    {r.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    ₹{Number(r.amountPaid).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">{r.verificationStatus}</td>
                  <td className="px-4 py-3">
                    {r.verificationStatus === "PENDING" ? (
                      <span className="flex gap-2">
                        <button
                          type="button"
                          className="text-emerald-700 hover:underline"
                          onClick={() => void verify(r.id, "verify")}
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() => void verify(r.id, "reject")}
                        >
                          Reject
                        </button>
                      </span>
                    ) : r.verificationStatus === "VERIFIED" && r.receiptNumber ? (
                      <a
                        href={`/admin/finance/income/print/${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2F4F3A] hover:underline"
                      >
                        Print
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title="Record manual income"
        description="Creates a pending record. A receipt number is assigned when an approver verifies it."
        wide
        closeDisabled={saveLoading}
      >
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          {error ? (
            <div className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <SelectField
            label="Income type"
            value={form.paymentCategory}
            onChange={(value) =>
              setForm({ ...form, paymentCategory: value as PaymentCategory })
            }
            includeEmptyOption={false}
          >
            {MANUAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PAYMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Payment method"
            value={form.paymentMethod}
            onChange={(value) => setForm({ ...form, paymentMethod: value })}
            includeEmptyOption={false}
          >
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Payer name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Mobile"
            required
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
          <TextField
            label="Address"
            className="sm:col-span-2"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <TextField
            label="Payment date"
            type="date"
            required
            value={form.paymentDate}
            onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
          />
          <TextField
            label="Need-by date (optional)"
            type="date"
            value={form.needByDate}
            onChange={(e) => setForm({ ...form, needByDate: e.target.value })}
          />
          <TextField
            label="Amount (₹)"
            required
            inputMode="decimal"
            value={form.amountPaid}
            onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
          />
          {form.paymentMethod !== "CASH" ? (
            <TextField
              label="Payment reference"
              required
              className="sm:col-span-2"
              value={form.paymentReference}
              onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
            />
          ) : null}
          <TextField
            label="Purpose / notes"
            className="sm:col-span-2"
            value={form.purposeOfRemittance}
            onChange={(e) => setForm({ ...form, purposeOfRemittance: e.target.value })}
          />
          {form.paymentCategory === "PROGRAM_FEE" || form.paymentCategory === "SUBSCRIPTION_FEE" ? (
            <SelectField
              label="Program"
              value={form.programId}
              onChange={(value) => setForm({ ...form, programId: value })}
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.title}
                </option>
              ))}
            </SelectField>
          ) : null}
          {form.paymentCategory === "EVENT_FEE" ? (
            <SelectField
              label="Event"
              value={form.eventId}
              onChange={(value) => setForm({ ...form, eventId: value })}
            >
              {events.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.title}
                </option>
              ))}
            </SelectField>
          ) : null}
          {form.paymentCategory === "SUBSCRIPTION_FEE" ? (
            <SelectField
              label="Subscription plan (optional)"
              value={form.subscriptionPlanId}
              onChange={(value) => setForm({ ...form, subscriptionPlanId: value })}
              placeholder="Select plan"
            >
              <option value="">None</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.title}
                </option>
              ))}
            </SelectField>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <SecondaryButton
              type="button"
              className="sm:w-auto"
              disabled={saveLoading}
              onClick={closeModal}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={saveLoading} className="sm:w-auto">
              {saveLoading ? "Saving…" : "Save receipt"}
            </PrimaryButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
