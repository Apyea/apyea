"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PublicSiteChrome } from "@/components/team/PublicSiteChrome";

type Member = {
  id: string;
  fullName: string;
  qualification: string | null;
  photoUrl: string | null;
  designation: { name: string };
  displayOrder: number;
};

export function OurTeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => setMembers(data.members ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicSiteChrome>
      <p className="mx-auto max-w-6xl px-5 pt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#5F7A66] lg:px-8">
        APYEA Team
      </p>
      <h1 className="mx-auto mt-2 max-w-6xl px-5 text-3xl font-bold tracking-tight text-[#1B3D32] lg:px-8">
        Our Team
      </h1>
      <p className="mx-auto mt-3 max-w-2xl px-5 text-sm leading-relaxed text-[#5F7A66] lg:px-8">
        Leadership and volunteers serving yoga educators across Andhra Pradesh.
      </p>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 lg:px-8">
        {loading ? (
          <p className="text-sm text-[#5F7A66]">Loading team…</p>
        ) : members.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-[#5F7A66] ring-1 ring-[#1E2E24]/8">
            Team profiles will appear here soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <article
                key={m.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#1E2E24]/8"
              >
                <div className="aspect-[4/3] bg-[#E8EFE9]">
                  {m.photoUrl ? (
                    <Image
                      src={m.photoUrl}
                      alt=""
                      width={400}
                      height={300}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#5F7A66]">
                      No photo
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
                    {m.designation.name}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#1B3D32]">{m.fullName}</h2>
                  {m.qualification ? (
                    <p className="mt-2 text-sm leading-relaxed text-[#4A5F50]">{m.qualification}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicSiteChrome>
  );
}