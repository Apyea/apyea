"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { SecondaryButton, TextAreaField, TextField } from "@/components/ui/form-primitives";

type EventRow = {
  id: string;
  code: string;
  title: string;
  registrationOpen: boolean;
  isActive: boolean;
  defaultFee: number | null;
  _count: { registrations: number };
};

export function EventsRegistrationSettings() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch("/api/admin/events");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Load failed");
    setEvents(data.events ?? []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function patchEvent(id: string, body: Record<string, unknown>) {
    setSavingId(id);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      <p className="text-sm text-zinc-600">
        Create event codes and fees under Finance → Programs & plans. Here you can open public
        registration and set descriptions.
      </p>
      <ul className="divide-y rounded-2xl border border-zinc-200 bg-white">
        {events.map((ev) => (
          <li key={ev.id} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs text-zinc-500">{ev.code}</span>
                <p className="font-medium text-zinc-900">{ev.title}</p>
                <p className="text-xs text-zinc-500">
                  {ev._count.registrations} registration(s)
                  {ev.defaultFee != null ? ` · ₹${ev.defaultFee}` : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ev.registrationOpen}
                  disabled={savingId === ev.id || !ev.isActive}
                  onChange={(e) =>
                    void patchEvent(ev.id, { registrationOpen: e.target.checked })
                  }
                />
                Registration open
              </label>
            </div>
            <EventDescriptionEditor
              eventId={ev.id}
              disabled={savingId === ev.id}
              onSave={(description, registrationClosesAt) =>
                patchEvent(ev.id, {
                  description,
                  registrationClosesAt: registrationClosesAt || null,
                })
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventDescriptionEditor({
  eventId,
  disabled,
  onSave,
}: {
  eventId: string;
  disabled: boolean;
  onSave: (description: string, closesAt: string) => Promise<void>;
}) {
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void adminFetch(`/api/admin/events/${eventId}`).then(async (res) => {
      const data = await res.json();
      const e = data.event;
      if (e) {
        setDescription(e.description ?? "");
        setClosesAt(
          e.registrationClosesAt
            ? new Date(e.registrationClosesAt).toISOString().slice(0, 16)
            : "",
        );
      }
      setLoaded(true);
    });
  }, [eventId]);

  if (!loaded) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <TextAreaField
        label="Public description"
        className="sm:col-span-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <TextField
        label="Registration closes"
        type="datetime-local"
        value={closesAt}
        onChange={(e) => setClosesAt(e.target.value)}
      />
      <div className="flex items-end">
        <SecondaryButton
          type="button"
          disabled={disabled}
          className="sm:w-auto"
          onClick={() =>
            void onSave(description, closesAt ? new Date(closesAt).toISOString() : "")
          }
        >
          Save details
        </SecondaryButton>
      </div>
    </div>
  );
}