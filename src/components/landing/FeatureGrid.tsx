const features = [
  {
    title: "Cognito on the server",
    description:
      "JWT verification with aws-jwt-verify and admin SDK calls for listing, creating, updating, and deleting pool users.",
  },
  {
    title: "Postgres as source of app truth",
    description:
      "Prisma models store roles and profile fields while Cognito remains the identity provider.",
  },
  {
    title: "Typed API routes",
    description:
      "Protected /api/users/me and /api/admin/users endpoints ready to wire to your client auth flow.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to start
          </h2>
          <p className="mt-4 text-slate-400">
            Copy `.env.example`, run migrations, and point your Cognito app
            client at this Next.js backend.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-slate-900/50 p-6"
            >
              <dt className="text-lg font-semibold text-white">
                {feature.title}
              </dt>
              <dd className="mt-3 text-sm leading-6 text-slate-400">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
