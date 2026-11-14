"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { PrimaryButton, SelectField, StepCard, TextField } from "@/components/ui/form-primitives";

type Tab = "programs" | "events" | "plans";

export function CatalogManager() {
  const [tab, setTab] = useState<Tab>("programs");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [programForm, setProgramForm] = useState({ code: "", title: "", defaultFee: "" });
  const [eventForm, setEventForm] = useState({
    code: "",
    title: "",
    programId: "",
    defaultFee: "",
  });
  const [planForm, setPlanForm] = useState({
    code: "",
    title: "",
    basis: "MEMBERSHIP",
    fee: "",
    durationMonths: "12",
  });

  const endpoint =
    tab === "programs"
      ? "/api/admin/finance/programs"
      : tab === "events"
        ? "/api/admin/finance/events"
        : "/api/admin/finance/subscription-plans";

  const load = useCallback(async () => {
    const res = await adminFetch(endpoint);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Load failed");
    const key = tab === "programs" ? "programs" : tab === "events" ? "events" : "plans";
    setItems(data[key] ?? []);
  }, [endpoint, tab]);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function createItem() {
    setError(null);
    const body =
      tab === "programs"
        ? { ...programForm, defaultFee: programForm.defaultFee ? Number(programForm.defaultFee) : undefined }
        : tab === "events"
          ? {
              ...eventForm,
              programId: eventForm.programId || undefined,
              defaultFee: eventForm.defaultFee ? Number(eventForm.defaultFee) : undefined,
            }
          : {
              ...planForm,
              fee: Number(planForm.fee),
              durationMonths: Number(planForm.durationMonths),
            };

    const res = await adminFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["programs", "events", "plans"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
              tab === t ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200"
            }`}
          >
            {t === "plans" ? "Subscription plans" : t}
          </button>
        ))}
      </div>

      {error ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      {tab === "programs" ? (
        <StepCard label="Add program">
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void createItem();
            }}
          >
            <TextField label="Code" required value={programForm.code} onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })} />
            <TextField label="Title" required value={programForm.title} onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })} />
            <TextField label="Default fee (₹)" value={programForm.defaultFee} onChange={(e) => setProgramForm({ ...programForm, defaultFee: e.target.value })} />
            <PrimaryButton type="submit">Create program</PrimaryButton>
          </form>
        </StepCard>
      ) : null}

      {tab === "events" ? (
        <StepCard label="Add event">
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void createItem();
            }}
          >
            <TextField label="Code" required value={eventForm.code} onChange={(e) => setEventForm({ ...eventForm, code: e.target.value })} />
            <TextField label="Title" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <TextField label="Default fee (₹)" value={eventForm.defaultFee} onChange={(e) => setEventForm({ ...eventForm, defaultFee: e.target.value })} />
            <PrimaryButton type="submit">Create event</PrimaryButton>
          </form>
        </StepCard>
      ) : null}

      {tab === "plans" ? (
        <StepCard label="Add subscription plan">
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void createItem();
            }}
          >
            <TextField label="Code" required value={planForm.code} onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })} />
            <TextField label="Title" required value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} />
            <SelectField
              label="Basis"
              value={planForm.basis}
              onChange={(value) => setPlanForm({ ...planForm, basis: value })}
              includeEmptyOption={false}
            >
              <option value="MEMBERSHIP">Membership</option>
              <option value="PROGRAM">Program</option>
              <option value="EVENT">Event</option>
            </SelectField>
            <TextField label="Fee (₹)" required value={planForm.fee} onChange={(e) => setPlanForm({ ...planForm, fee: e.target.value })} />
            <TextField label="Duration (months)" value={planForm.durationMonths} onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })} />
            <PrimaryButton type="submit">Create plan</PrimaryButton>
          </form>
        </StepCard>
      ) : null}

      <ul className="divide-y rounded-2xl border border-zinc-200 bg-white">
        {items.map((item) => (
          <li key={String(item.id)} className="px-4 py-3 text-sm">
            <span className="font-mono text-xs text-zinc-500">{String(item.code)}</span>
            <span className="mx-2">·</span>
            <span className="font-medium">{String(item.title)}</span>
            {item.isActive === false ? (
              <span className="ml-2 text-xs text-amber-700">(inactive)</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
