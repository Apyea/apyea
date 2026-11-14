"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import {
  TEAM_DESIGNATION_OPTIONS,
  teamDesignationLabel,
  type TeamDesignationValue,
} from "@/lib/team/options";
import { FormModal } from "@/components/ui/form-modal";
import {
  PrimaryButton,
  SecondaryButton,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/form-primitives";
import { TableSkeletonRows } from "@/components/ui/skeleton";

type MemberRow = {
  id: string;
  fullName: string;
  designation: TeamDesignationValue;
  qualification: string | null;
  displayOrder: number;
  photoFile: { storageKey: string } | null;
};

function photoUrl(storageKey: string | undefined) {
  if (!storageKey) return null;
  return `/api/files/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

function defaultForm() {
  return {
    fullName: "",
    designation: "" as TeamDesignationValue | "",
    qualification: "",
    displayOrder: "0",
  };
}

export function TeamMembersManager() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQ.trim()) params.set("q", searchQ.trim());
      const res = await adminFetch(`/api/admin/team/members?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Load failed");
      setMembers(data.members ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [searchQ]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm());
    setPhotoFile(null);
    setExistingPhotoUrl(null);
    setError(null);
    setModalOpen(true);
  }

  async function openEdit(id: string) {
    setError(null);
    const res = await adminFetch(`/api/admin/team/members/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Load failed");
      return;
    }
    const m = data.member;
    setEditingId(id);
    setForm({
      fullName: m.fullName,
      designation: m.designation,
      qualification: m.qualification ?? "",
      displayOrder: String(m.displayOrder),
    });
    setExistingPhotoUrl(photoUrl(m.photoFile?.storageKey));
    setPhotoFile(null);
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);
    const body = new FormData();
    body.set("fullName", form.fullName);
    body.set("designation", form.designation);
    body.set("qualification", form.qualification);
    body.set("displayOrder", form.displayOrder);
    if (photoFile) body.set("photo", photoFile);

    try {
      const res = await adminFetch(
        editingId ? `/api/admin/team/members/${editingId}` : "/api/admin/team/members",
        { method: editingId ? "PATCH" : "POST", body },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setModalOpen(false);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaveLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this team member?")) return;
    const res = await adminFetch(`/api/admin/team/members/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Delete failed");
      return;
    }
    await loadMembers();
  }

  return (
    <div className="space-y-4">
      {error && !modalOpen ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <TextField
            label="Search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Name or qualification…"
            className="sm:w-56"
          />
          <SecondaryButton type="button" className="sm:w-auto" onClick={() => void loadMembers()}>
            Apply
          </SecondaryButton>
        </div>
        <PrimaryButton type="button" className="sm:w-auto" onClick={openCreate}>
          <span className="inline-flex items-center gap-2">
            <PlusIcon className="h-4 w-4" /> Add team member
          </span>
        </PrimaryButton>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Qualification</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows columns={6} />
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No team members yet.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 tabular-nums text-zinc-600">{m.displayOrder}</td>
                  <td className="px-4 py-3 font-medium">{m.fullName}</td>
                  <td className="px-4 py-3">{teamDesignationLabel(m.designation)}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-600">
                    {m.qualification ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {m.photoFile ? (
                      <span className="text-emerald-700">Yes</span>
                    ) : (
                      <span className="text-zinc-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex gap-2">
                      <button
                        type="button"
                        className="text-[#2F4F3A] hover:underline"
                        onClick={() => void openEdit(m.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => void remove(m.id)}
                      >
                        Delete
                      </button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => !saveLoading && setModalOpen(false)}
        title={editingId ? "Edit team member" : "Add team member"}
        description="Name, designation, qualification, photograph, and display order."
        wide
        closeDisabled={saveLoading}
      >
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          {error ? (
            <div className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <TextField
            label="Name"
            required
            className="sm:col-span-2"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <SelectField
            label="Designation"
            required
            value={form.designation}
            onChange={(v) => setForm({ ...form, designation: v as TeamDesignationValue })}
            includeEmptyOption
            placeholder="Select designation"
          >
            {TEAM_DESIGNATION_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Display order"
            inputMode="numeric"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
          />
          <TextAreaField
            label="Qualification"
            className="sm:col-span-2"
            value={form.qualification}
            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            rows={3}
          />
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-[#1E2E24]">Photograph</label>
            {existingPhotoUrl && !photoFile ? (
              <p className="text-xs text-zinc-500">Current photo on file. Upload to replace.</p>
            ) : null}
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <SecondaryButton
              type="button"
              className="sm:w-auto"
              disabled={saveLoading}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <SecondaryButton type="submit" disabled={saveLoading} className="sm:w-auto">
              {saveLoading ? "Saving…" : "Save"}
            </SecondaryButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}