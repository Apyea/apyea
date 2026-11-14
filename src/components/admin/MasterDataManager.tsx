"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useStore } from "@/components/ui/tanstack-form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { MASTER_RESOURCES, type MasterResource } from "@/lib/master-data/resources";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MasterDataSkeleton } from "@/components/ui/skeleton";
import {
  PrimaryButton,
  SecondaryButton,
  SelectField,
  StepCard,
  TextField,
} from "@/components/ui/form-primitives";

type Row = Record<string, unknown> & { id: string };

const RESOURCE_LABELS: Record<MasterResource, string> = {
  genders: "Genders",
  nationalities: "Nationalities",
  states: "States",
  districts: "Districts",
  mandals: "Mandals",
  "yoga-qualification-levels": "Yoga Qualification Levels",
  "yoga-professional-types": "Yoga Professional Types",
  "employment-statuses": "Employment Statuses",
  "gov-work-interest-options": "Gov Work Interest Options",
  "volunteer-responses": "Volunteer Responses",
  "lecture-languages": "Lecture Languages",
  "employment-preference-types": "Employment Preference Types",
  "professional-challenge-types": "Professional Challenge Types",
};

function displayLabel(row: Row) {
  return String(row.label ?? row.name ?? row.code ?? row.id);
}

const MASTER_FORM_DEFAULTS = {
  code: "",
  label: "",
  sortOrder: "0",
  stateId: "",
  districtId: "",
};

type MasterFormValues = typeof MASTER_FORM_DEFAULTS;

export function MasterDataManager() {
  const [resource, setResource] = useState<MasterResource>("genders");
  const [items, setItems] = useState<Row[]>([]);
  const [states, setStates] = useState<Row[]>([]);
  const [districts, setDistricts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const masterForm = useForm({ defaultValues: MASTER_FORM_DEFAULTS });
  const form = useStore(masterForm.store, (s) => s.values);

  function setFormValues(patch: Partial<MasterFormValues>) {
    (Object.entries(patch) as [keyof MasterFormValues, MasterFormValues[keyof MasterFormValues]][]).forEach(
      ([key, value]) => masterForm.setFieldValue(key, value),
    );
  }
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/master/${resource}`;
      if (resource === "districts" && form.stateId) {
        url += `?stateId=${form.stateId}`;
      }
      if (resource === "mandals" && form.districtId) {
        url += `?districtId=${form.districtId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Load failed");
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [resource, form.stateId, form.districtId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    fetch("/api/admin/master/states")
      .then((r) => r.json())
      .then((d) => setStates(d.items ?? []));
  }, []);

  useEffect(() => {
    if (!form.stateId) {
      setDistricts([]);
      return;
    }
    fetch(`/api/admin/master/districts?stateId=${form.stateId}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.items ?? []));
  }, [form.stateId]);

  async function createItem() {
    setError(null);
    const body: Record<string, unknown> = {
      code: form.code,
      label: form.label,
      name: form.label,
      sortOrder: Number(form.sortOrder || 0),
    };
    if (resource === "districts") body.stateId = form.stateId;
    if (resource === "mandals") body.districtId = form.districtId;

    const res = await fetch(`/api/admin/master/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    masterForm.reset({
      code: "",
      label: "",
      sortOrder: "0",
      stateId: form.stateId,
      districtId: form.districtId,
    });
    await loadItems();
  }

  async function toggleActive(row: Row) {
    setError(null);
    await fetch(`/api/admin/master/${resource}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    await loadItems();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/master/${resource}/${pendingDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setPendingDelete(null);
      await loadItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={pendingDelete != null}
        onClose={() => setPendingDelete(null)}
        title="Delete master record?"
        tone="danger"
        confirmLabel="Delete permanently"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        description={
          pendingDelete ? (
            <>
              Permanently delete <strong className="text-[#1E2E24]">{displayLabel(pendingDelete)}</strong>{" "}
              from the database? This cannot be undone. If surveys, membership applications, or other
              data still reference this value, deletion will be blocked.
            </>
          ) : null
        }
      />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr] xl:grid-cols-[minmax(0,300px)_1fr]">
      <StepCard label="Master tables">
        <nav aria-label="Master tables">
          <ul className="max-h-[min(70vh,640px)] space-y-0.5 overflow-y-auto pr-0.5">
            {MASTER_RESOURCES.map((r) => {
              const active = resource === r;
              return (
                <li key={r}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => setResource(r)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm leading-snug transition ${
                      active
                        ? "bg-[#2F4F3A] font-semibold text-white shadow-sm"
                        : "font-medium text-[#1E2E24] hover:bg-[#EEF1ED]"
                    }`}
                  >
                    {RESOURCE_LABELS[r]}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {resource === "districts" ? (
          <SelectField
            label="Filter by state"
            placeholder="All"
            value={form.stateId}
            onChange={(stateId) => setFormValues({ stateId })}
          >
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {displayLabel(s)}
              </option>
            ))}
          </SelectField>
        ) : null}

        {resource === "mandals" ? (
          <>
            <SelectField
              label="Filter by state"
              placeholder="State"
              value={form.stateId}
              onChange={(stateId) => setFormValues({ stateId, districtId: "" })}
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {displayLabel(s)}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Filter by district"
              placeholder="District"
              value={form.districtId}
              onChange={(districtId) => setFormValues({ districtId })}
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {displayLabel(d)}
                </option>
              ))}
            </SelectField>
          </>
        ) : null}
      </StepCard>

      <div className="space-y-4">
        <StepCard label={`Add — ${RESOURCE_LABELS[resource]}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Code"
              value={form.code}
              onChange={(e) => setFormValues({ code: e.target.value })}
            />
            <TextField
              label="Label / name"
              value={form.label}
              onChange={(e) => setFormValues({ label: e.target.value })}
            />
            {resource === "districts" ? (
              <SelectField
                span="sm"
                label="State"
                placeholder="Select state"
                value={form.stateId}
                onChange={(stateId) => setFormValues({ stateId })}
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {displayLabel(s)}
                  </option>
                ))}
              </SelectField>
            ) : null}
            {resource === "mandals" ? (
              <SelectField
                span="sm"
                label="District"
                placeholder="Select district"
                value={form.districtId}
                onChange={(districtId) => setFormValues({ districtId })}
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {displayLabel(d)}
                  </option>
                ))}
              </SelectField>
            ) : null}
          </div>
          <PrimaryButton type="button" className="w-auto" onClick={createItem}>
            Add record
          </PrimaryButton>
        </StepCard>

        <StepCard label={`Records — ${RESOURCE_LABELS[resource]}`}>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {loading && items.length === 0 ? (
            <MasterDataSkeleton />
          ) : (
          <ul className="divide-y divide-zinc-950/10 rounded-xl border border-zinc-950/10 bg-white">
            {items.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-zinc-950">{displayLabel(row)}</p>
                  <p className="text-xs text-zinc-950/45">
                    {String(row.code ?? "")}{" "}
                    {row.isActive === false ? "· inactive" : "· active"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SecondaryButton type="button" onClick={() => toggleActive(row)}>
                    {row.isActive === false ? "Activate" : "Deactivate"}
                  </SecondaryButton>
                  <button
                    type="button"
                    aria-label={`Delete ${displayLabel(row)}`}
                    title="Delete"
                    onClick={() => setPendingDelete(row)}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-[#1E2E24]/12 bg-white text-[#5F7A66] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="size-[18px]" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
            {!loading && items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-950/45">No records</li>
            ) : null}
          </ul>
          )}
        </StepCard>
      </div>
    </div>
    </>
  );
}
