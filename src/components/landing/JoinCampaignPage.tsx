"use client";

import Image from "next/image";
import Link from "next/link";
import { APYEA_LOGO_ALT, APYEA_LOGO_SRC } from "@/lib/brand";

const VOICE_PILLARS = [
  {
    title: "Employment Opportunities",
    text: "In schools, colleges, government institutions, healthcare and wellness.",
  },
  {
    title: "Dedicated Yoga Teacher Posts",
    text: "Advocacy for Yoga teaching positions in educational institutions.",
  },
  {
    title: "Policy Representation",
    text: "Evidence-based recommendations on recruitment criteria, professional recognition and the future of Yoga education.",
  },
  {
    title: "Recognition of Qualifications",
    text: "Due consideration to Yoga qualifications, training and experience.",
  },
  {
    title: "Career Growth",
    text: "Professional development, progression and continuing education.",
  },
] as const;

export function JoinCampaignPage() {
  return (
    <div className="min-h-full bg-[#FAF7F2] text-[#1E2E24]">
      <header className="bg-[#1B3D32] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center">
              <Image
                src={APYEA_LOGO_SRC}
                alt={APYEA_LOGO_ALT}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </span>
            <span className="hidden text-xs font-semibold uppercase tracking-wide sm:block">
              APYEA
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#E8D5A8] transition hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
        <div className="mx-auto max-w-4xl px-5 pb-12 pt-4 lg:px-8 lg:pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
            Andhra Pradesh Yoga Educators Association (APYEA)
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
            Voice of Yoga Teachers
          </h1>
          <p className="mt-3 text-lg font-medium text-[#E8C872]">
            A Statewide Professional Survey · Andhra Pradesh
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
        <section aria-labelledby="join-lede">
          <h2
            id="join-lede"
            className="font-serif text-2xl font-bold leading-snug text-[#1B3D32] sm:text-3xl"
          >
            Your Qualification. Your Experience. Your Voice. Our Collective Future.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#4A5F50]">
            APYEA is bringing Yoga professionals onto one common platform to document their
            qualifications, experience, employment status and challenges, and to present a collective
            representation to the{" "}
            <strong className="font-semibold text-[#1B3D32]">
              Government of Andhra Pradesh
            </strong>{" "}
            and relevant authorities.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="why-voice">
          <h2
            id="why-voice"
            className="border-b-4 border-[#C9A227] pb-2 text-sm font-bold uppercase tracking-[0.15em] text-[#1B3D32]"
          >
            Why your voice matters
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {VOICE_PILLARS.map((item, index) => (
              <li
                key={item.title}
                className="rounded-2xl bg-white p-5 ring-1 ring-[#1E2E24]/8"
              >
                <span className="text-xs font-bold text-[#8A6B2E]">{index + 1}.</span>
                <h3 className="mt-1 font-semibold text-[#1B3D32]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F7A66]">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mt-12 rounded-2xl bg-[#EEF1ED] p-6 ring-1 ring-[#1E2E24]/6 lg:p-8"
          aria-labelledby="who-can"
        >
          <h2 id="who-can" className="text-lg font-bold text-[#1B3D32]">
            Who can participate?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5F50] sm:text-base">
            Yoga teachers, educators, instructors, trainers, researchers and academicians across
            Andhra Pradesh: certificate and diploma holders, postgraduates and doctorates, BNYS
            graduates, YCB-certified professionals and more. Employed, self-employed, independent
            or seeking work — your voice matters.
          </p>
        </section>

        <section className="mt-12 rounded-2xl bg-[#E8C872] px-6 py-8 text-center lg:px-10">
          <p className="font-serif text-2xl font-bold text-[#1B3D32] sm:text-3xl">
            Take the survey. Make your voice count.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[#2F4F3A]">
            Complete the Yoga Educator Survey (separate from APYEA membership). Membership uses{" "}
            <Link href="/membership/apply" className="font-medium underline">
              Apply for membership
            </Link>
            .
          </p>
          <Link
            href="/survey"
            className="mt-6 inline-flex rounded-full bg-[#1B3D32] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#143028]"
          >
            Register now
          </Link>
        </section>
      </main>

      <footer className="bg-[#1B3D32] py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
          One Profession · One Community · One Collective Voice
        </p>
      </footer>
    </div>
  );
}
