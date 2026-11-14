"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicSiteChrome } from "@/components/team/PublicSiteChrome";

type EventRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  venue: string | null;
  defaultFee: number | null;
  programTitle: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Date to be announced";
  return new Date(value).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PublicEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicSiteChrome>
      <p className="mx-auto max-w-6xl px-5 pt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#5F7A66] lg:px-8">
        APYEA Events
      </p>
      <h1 className="mx-auto mt-2 max-w-6xl px-5 text-3xl font-bold tracking-tight text-[#1B3D32] lg:px-8">
        Event registrations
      </h1>
      <p className="mx-auto mt-3 max-w-2xl px-5 text-sm leading-relaxed text-[#5F7A66] lg:px-8">
        Register for upcoming workshops and programs. Payment is verified by APYEA before confirmation.
      </p>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 lg:px-8">
        {loading ? (
          <p className="text-sm text-[#5F7A66]">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-[#5F7A66] ring-1 ring-[#1E2E24]/8">
            No events are open for registration right now.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#1E2E24]/8"
              >
                <p className="font-mono text-xs text-[#5F7A66]">{ev.code}</p>
                <h2 className="mt-1 text-lg font-semibold text-[#1B3D32]">{ev.title}</h2>
                {ev.programTitle ? (
                  <p className="mt-1 text-xs text-[#5F7A66]">{ev.programTitle}</p>
                ) : null}
                <p className="mt-3 text-sm text-[#4A5F50]">{formatDate(ev.eventDate)}</p>
                {ev.venue ? <p className="text-sm text-[#5F7A66]">{ev.venue}</p> : null}
                {ev.defaultFee != null ? (
                  <p className="mt-2 text-sm font-medium text-[#1B3D32]">
                    Fee: ₹{ev.defaultFee.toFixed(2)}
                  </p>
                ) : null}
                {ev.description ? (
                  <p className="mt-3 line-clamp-3 text-sm text-[#5F7A66]">{ev.description}</p>
                ) : null}
                <Link
                  href={`/events/${ev.id}/register`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#2F4F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1B3D32]"
                >
                  Register
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicSiteChrome>
  );
}