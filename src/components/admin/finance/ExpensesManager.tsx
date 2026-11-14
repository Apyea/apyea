"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExpenseCategory, ExpenseVoucherStatus } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/24/outline";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { EXPENSE_CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/finance/labels";
import { FormModal } from "@/components/ui/form-modal";
import { PrimaryButton, SecondaryButton, SelectField, TextField } from "@/components/ui/form-primitives";
import { TableSkeletonRows } from "@/components/ui/skeleton";

type VoucherRow = {
  id: string;
  voucherNumber: string;
  expenseCategory: ExpenseCategory;
  status: ExpenseVoucherStatus;
  expenseDate: string;
  description: string;
  amount: string;
  paidTo: string;
  paymentMethod: string;
  supportingBillFile?: {
    storageKey: string;
    originalFilename: string;
  } | null;
};

function storedFileUrl(storageKey: string) {
  return `/api/files/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

const EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

function defaultExpenseForm() {
  return {
    expenseCategory: "ADMINISTRATIVE" as ExpenseCategory,
    expenseDate: new Date().toISOString().slice(0, 10),
    description: "",
    amount: "",
    paymentMethod: "ONLINE",
    paidTo: "",
    transactionRef: "",
    supportingBillNo: "",
    programId: "",
  };
}

export function ExpensesManager() {
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultExpenseForm);
  const [billFile, setBillFile] = useState<File | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      const qs = params.toString();
      const res = await adminFetch(
        `/api/admin/finance/expenses${qs ? `?${qs}` : ""}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Load failed");
      setVouchers(data.vouchers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setListLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredVouchers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return vouchers;
    return vouchers.filter(
      (v) =>
        v.voucherNumber.toLowerCase().includes(q) ||
        v.paidTo.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q),
    );
  }, [vouchers, searchQuery]);

  function openModal() {
    setForm(defaultExpenseForm());
    setBillFile(null);
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
      const body = new FormData();
      body.set("expenseCategory", form.expenseCategory);
      body.set("expenseDate", form.expenseDate);
      body.set("description", form.description);
      body.set("amount", form.amount);
      body.set("paymentMethod", form.paymentMethod);
      body.set("paidTo", form.paidTo);
      if (form.transactionRef) body.set("transactionRef", form.transactionRef);
      if (form.supportingBillNo) body.set("supportingBillNo", form.supportingBillNo);
      if (form.programId) body.set("programId", form.programId);
      if (billFile) body.set("bill", billFile);

      const res = await adminFetch("/api/admin/finance/expenses", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaveLoading(false);
    }
  }

  async function approve(id: string, action: "approve" | "reject") {
    setError(null);
    const res = await adminFetch(`/api/admin/finance/expenses/${id}`, {
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
            placeholder="Voucher, payee, description…"
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
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="sm:w-44"
          >
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c]}
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
              <th className="px-4 py-3">Voucher</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Paid to</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Bill</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <TableSkeletonRows columns={8} rows={7} />
            ) : filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                  No vouchers match your filters.
                </td>
              </tr>
            ) : (
              filteredVouchers.map((v) => (
                <tr key={v.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-mono text-xs">{v.voucherNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(v.expenseDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">{EXPENSE_CATEGORY_LABELS[v.expenseCategory]}</td>
                  <td className="max-w-[12rem] truncate px-4 py-3" title={v.paidTo}>
                    {v.paidTo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    ₹{Number(v.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    {v.supportingBillFile ? (
                      <a
                        href={storedFileUrl(v.supportingBillFile.storageKey)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2F4F3A] hover:underline"
                        title={v.supportingBillFile.originalFilename}
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{v.status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    {v.status === "SUBMITTED" ? (
                      <span className="flex gap-2">
                        <button
                          type="button"
                          className="text-emerald-700 hover:underline"
                          onClick={() => void approve(v.id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() => void approve(v.id, "reject")}
                        >
                          Reject
                        </button>
                      </span>
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
        title="New expense voucher"
        description="Creates a submitted voucher awaiting approval."
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
            label="Category"
            value={form.expenseCategory}
            onChange={(value) =>
              setForm({ ...form, expenseCategory: value as ExpenseCategory })
            }
            includeEmptyOption={false}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Expense date"
            type="date"
            required
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
          />
          <TextField
            label="Amount (₹)"
            required
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
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
            label="Paid to"
            required
            className="sm:col-span-2"
            value={form.paidTo}
            onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
          />
          <TextField
            label="Description"
            required
            className="sm:col-span-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            label="Transaction reference"
            className="sm:col-span-2"
            value={form.transactionRef}
            onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
          />
          <TextField
            label="Bill / invoice number (optional)"
            value={form.supportingBillNo}
            onChange={(e) => setForm({ ...form, supportingBillNo: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1E2E24]">
              Bill or receipt (optional)
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#FAF7F2] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2F4F3A]"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setBillFile(file);
              }}
            />
            <p className="text-xs text-zinc-500">PDF or image, up to 10 MB.</p>
            {billFile ? (
              <p className="text-xs text-zinc-600">Selected: {billFile.name}</p>
            ) : null}
          </div>
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
              {saveLoading ? "Saving…" : "Save voucher"}
            </PrimaryButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
