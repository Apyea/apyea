"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { APYEA_LOGO_ALT, APYEA_LOGO_SRC } from "@/lib/brand";
import { useState } from "react";

const NAV = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "/team", label: "Our Team" },
  { href: "/events", label: "Events" },
  { href: "#vision", label: "Vision" },
  { href: "#programs", label: "Programmes" },
  { href: "#join", label: "Join" },
] as const;

const HIGHLIGHTS = [
  {
    title: "Professional unity",
    text: "Connect qualified Yoga teachers and educators across Andhra Pradesh on one platform.",
  },
  {
    title: "Education & standards",
    text: "Promote quality Yoga education, ethical practice, and recognized qualification pathways.",
  },
  {
    title: "Careers & policy",
    text: "Support employment opportunities and constructive dialogue with government and institutions.",
  },
] as const;

const PROGRAMMES = [
  { title: "Training programmes", text: "Structured programmes to build teaching skills and competence." },
  { title: "Workshops & seminars", text: "Focused sessions for sharing experience and best practices." },
  { title: "Conferences", text: "Forums for academic exchange and professional interaction." },
  { title: "Continuing development", text: "Ongoing education to support career progression." },
  { title: "Research collaboration", text: "Documentation and publications grounded in Yoga tradition." },
  { title: "Policy engagement", text: "Dialogue on qualifications, recruitment, and Yoga in education." },
] as const;

const WHY_JOIN = [
  "Professional community and networking",
  "Knowledge sharing through workshops and conferences",
  "Collective support for employment and career development",
  "Representation on qualifications and recruitment standards",
  "Research and academic collaboration",
  "Stronger recognition of Yoga education pathways",
] as const;

const QUALIFICATIONS = [
  "Ph.D., M.A., or M.Sc. in Yoga",
  "Postgraduate Diploma or Diploma in Yoga",
  "BNYS and recognized certificate courses",
  "Yoga Certification Board (YCB) certifications",
  "Other recognized qualifications in Yoga and allied disciplines",
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5F7A66]">{children}</p>
  );
}

export function ApyeaLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#FAF7F2] text-[#1E2E24]">
      <header className="sticky top-0 z-50 border-b border-[#1E2E24]/5 bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="#home" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center">
              <Image
                src={APYEA_LOGO_SRC}
                alt={APYEA_LOGO_ALT}
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold tracking-tight">APYEA</span>
              <span className="block text-[11px] font-medium text-[#5F7A66]">
                Andhra Pradesh Yoga Educators Association
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-[#3D5244] transition hover:bg-[#E8EFE9] hover:text-[#1E2E24]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/join"
              className="rounded-full bg-[#2F4F3A] px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] shadow-sm transition hover:bg-[#243D2E]"
            >
              Join
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex rounded-full border border-[#1E2E24]/10 p-2.5 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="size-5" />
          </button>
        </div>
      </header>

      <Dialog open={mobileOpen} onClose={setMobileOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-[#1E2E24]/40" aria-hidden="true" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#FAF7F2] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Menu</span>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <XMarkIcon className="size-6" />
            </button>
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium hover:bg-[#E8EFE9]"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="mt-4 rounded-full bg-[#2F4F3A] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Join
            </Link>
          </nav>
        </DialogPanel>
      </Dialog>

      <main>
        <section id="home" className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-[#D4E4D8]/60 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#EDE4D4]/80 blur-3xl"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <SectionLabel>Professional wellness community</SectionLabel>
              <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-[#1E2E24] sm:text-5xl lg:text-[3.25rem]">
                Uniting qualified Yoga professionals across Andhra Pradesh
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4A5F50]">
                APYEA is a professional platform for Yoga teachers, educators, instructors,
                practitioners, and researchers — advancing education, standards, and opportunity.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#8A6B2E]">
                One Profession · One Community · One Platform
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/join"
                  className="rounded-full bg-[#2F4F3A] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#2F4F3A]/20 transition hover:bg-[#243D2E]"
                >
                  Join
                </Link>
                <a
                  href="#why"
                  className="rounded-full border border-[#1E2E24]/15 bg-white px-6 py-3 text-sm font-semibold text-[#1E2E24] transition hover:border-[#2F4F3A]/30"
                >
                  Why APYEA
                </a>
              </div>
              <ul className="mt-10 flex flex-wrap gap-2">
                {["Teachers", "Educators", "Researchers", "Practitioners", "Academicians"].map(
                  (tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#3D5244] ring-1 ring-[#1E2E24]/8"
                    >
                      {tag}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_24px_60px_-24px_rgba(30,46,36,0.35)] ring-1 ring-[#1E2E24]/5 lg:rounded-[2.5rem] lg:p-6">
                <Image
                  src={APYEA_LOGO_SRC}
                  alt={APYEA_LOGO_ALT}
                  width={947}
                  height={1024}
                  priority
                  sizes="(min-width: 1024px) 480px, 90vw"
                  className="h-auto w-full rounded-[1.25rem] object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#1E2E24]/5 bg-white py-14 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-3 lg:px-8">
            {HIGHLIGHTS.map((item) => (
              <article key={item.title} className="rounded-2xl bg-[#FAF7F2] p-6 ring-1 ring-[#1E2E24]/5">
                <h2 className="text-lg font-semibold text-[#1E2E24]">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#5F7A66]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <SectionLabel>About APYEA</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                A common platform for qualified Yoga educators
              </h2>
              <p className="mt-4 text-[#4A5F50] leading-relaxed">
                APYEA brings together professionals from diverse academic and institutional
                backgrounds to strengthen Yoga teaching, research, professional development, and
                public awareness across Andhra Pradesh.
              </p>
            </div>
            <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-4 text-[#4A5F50] leading-relaxed">
                <p>
                  Yoga is integral to health, education, and holistic development. There is growing
                  demand for qualified educators in schools, universities, healthcare, and wellness
                  settings.
                </p>
                <p>
                  APYEA supports appropriate qualification standards, employment opportunities,
                  career progression, and policy frameworks for the Yoga profession.
                </p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#1E2E24]/5 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5F7A66]">
                  Recognized qualifications include
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {QUALIFICATIONS.map((q) => (
                    <li key={q} className="flex gap-2 text-sm text-[#1E2E24]">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#2F4F3A]" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="vision" className="bg-[#2F4F3A] py-16 text-[#EEF4EC] lg:py-24">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <SectionLabel>
                  <span className="text-[#C5D9C8]">Our vision</span>
                </SectionLabel>
                <p className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">
                  A united, respected, and professionally recognized community of Yoga teachers and
                  educators in Andhra Pradesh and beyond.
                </p>
              </div>
              <div>
                <SectionLabel>
                  <span className="text-[#C5D9C8]">Our mission</span>
                </SectionLabel>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#D8E8DA] sm:text-base">
                  <li>Unite qualified Yoga professionals on one platform.</li>
                  <li>Promote excellence in teaching and continuing professional development.</li>
                  <li>Strengthen professional identity through appropriate standards.</li>
                  <li>Encourage research and partnerships with institutions and government.</li>
                  <li>Foster authentic, responsible, systematic practice and teaching of Yoga.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="programs" className="py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionLabel>Programmes</SectionLabel>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Activities for educators</h2>
              </div>
              <p className="max-w-md text-sm text-[#5F7A66]">
                Schedules and registration details will be announced as each programme is confirmed.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROGRAMMES.map((p) => (
                <li
                  key={p.title}
                  className="rounded-2xl border border-[#1E2E24]/8 bg-white p-6 transition hover:border-[#2F4F3A]/25 hover:shadow-md hover:shadow-[#2F4F3A]/5"
                >
                  <h3 className="font-semibold text-[#1E2E24]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5F7A66]">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="why" className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <div>
                <SectionLabel>Why APYEA</SectionLabel>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Bridge the gap for Yoga professionals
                </h2>
                <p className="mt-4 text-[#4A5F50] leading-relaxed">
                  As Yoga expands across education, healthcare, and community programmes, qualified
                  educators need a shared space to connect, collaborate, learn, and represent their
                  profession.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {WHY_JOIN.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl bg-[#FAF7F2] px-4 py-3.5 text-sm font-medium text-[#1E2E24] ring-1 ring-[#1E2E24]/5"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="news" className="py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="rounded-3xl border border-dashed border-[#1E2E24]/15 bg-[#FAF7F2] px-6 py-10 text-center sm:px-10">
              <SectionLabel>News & updates</SectionLabel>
              <h2 className="mt-3 text-xl font-semibold">Announcements coming soon</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#5F7A66]">
                Programme announcements, policy updates, and association news will be posted here.
              </p>
            </div>
          </div>
        </section>

        <section id="join" className="pb-20 pt-4 lg:pb-28">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#E8EFE9] via-[#FAF7F2] to-[#EDE4D4] p-8 ring-1 ring-[#1E2E24]/8 lg:p-12">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <SectionLabel>Membership</SectionLabel>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight">Join APYEA today</h2>
                  <p className="mt-4 max-w-lg text-[#4A5F50] leading-relaxed">
                    Apply for APYEA membership with documents and payment proof. The Yoga Educator
                    Survey is a separate form for professional research data.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <Link
                    href="/membership/apply"
                    className="inline-flex items-center justify-center rounded-full bg-[#2F4F3A] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2F4F3A]/25 transition hover:bg-[#243D2E]"
                  >
                    Apply for membership
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-[#1E2E24]/15 bg-white/80 px-8 py-3.5 text-sm font-semibold text-[#1E2E24] backdrop-blur-sm"
                  >
                    Member login
                  </Link>
                  <Link
                    href="/admin/membership/applications"
                    className="inline-flex items-center justify-center rounded-full border border-[#1E2E24]/15 bg-white/80 px-8 py-3.5 text-sm font-medium text-[#5F7A66] backdrop-blur-sm"
                  >
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1E2E24]/8 bg-[#1E2E24] py-12 text-[#C5D9C8]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 lg:flex-row lg:justify-between lg:px-8">
          <div className="max-w-sm">
            <div className="w-40 rounded-xl bg-white p-2">
              <Image
                src={APYEA_LOGO_SRC}
                alt={APYEA_LOGO_ALT}
                width={947}
                height={1024}
                sizes="160px"
                className="h-auto w-full object-contain"
              />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">One Profession. One Community. One Platform.</p>
            <p className="mt-2 text-sm">Andhra Pradesh Yoga Educators Association (APYEA)</p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
