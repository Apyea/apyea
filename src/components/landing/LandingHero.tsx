import { CheckCircleIcon } from "@heroicons/react/24/outline";

const highlights = [
  "Next.js App Router with TypeScript",
  "PostgreSQL profiles synced from Cognito",
  "Admin APIs for create, update, and delete users",
];

export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">
            AWS Cognito + PostgreSQL
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Custom user management,{" "}
            <span className="text-indigo-300">built for production</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Authenticate with Cognito, persist app data in Postgres, and manage
            users from secure server routes. Tailwind CSS and Headless UI keep
            the UI accessible and polished.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/register"
              className="rounded-lg bg-[#3d79ff] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3d79ff]/30 transition hover:bg-[#2f66e0]"
            >
              Yoga professional registration
            </a>
            <a
              href="/admin/registrations"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/5"
            >
              Admin console
            </a>
          </div>
        </div>

        <ul className="mx-auto mt-16 grid max-w-2xl gap-4 sm:grid-cols-1">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-slate-200"
            >
              <CheckCircleIcon
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-indigo-400"
              />
              <span className="text-sm sm:text-base">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
