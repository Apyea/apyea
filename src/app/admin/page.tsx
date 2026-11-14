import Link from "next/link";

const QUICK_LINKS = [
  { href: "/admin/membership/applications", label: "Membership applications" },
  { href: "/admin/surveys", label: "Educator surveys" },
  { href: "/admin/team", label: "Our Team" },
  { href: "/admin/finance", label: "Finance summary" },
  { href: "/admin/master", label: "Master data" },
] as const;

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">Overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          One sign-in at{" "}
          <Link href="/login" className="font-medium text-[#2F4F3A] hover:underline">
            /login
          </Link>{" "}
          for members and staff. After sign-in, staff land here; members use the member dashboard.
          Navigation is grouped in the sidebar — finance and master data depend on your role.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-[#5F7A66]/40 hover:bg-zinc-50"
          >
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
