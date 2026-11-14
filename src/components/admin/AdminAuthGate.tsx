"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { UserRole } from "@prisma/client";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { isStaffRole } from "@/lib/auth/staff-roles";
import { roleCanAccessPath } from "@/lib/admin/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminShellSkeleton, AdminTablePageSkeleton } from "@/components/ui/skeleton";

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin";
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/auth/session", { credentials: "include" });
      const data = await res.json();
      if (res.status === 401) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Session failed");
      if (!isStaffRole(data.user?.role)) {
        setError("forbidden");
        setUser(data.user ?? null);
        return;
      }
      if (!roleCanAccessPath(data.user.role, pathname)) {
        setError("forbidden-path");
        setUser(data.user);
        return;
      }
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session failed");
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <AdminShellSkeleton>
        <AdminTablePageSkeleton columns={5} />
      </AdminShellSkeleton>
    );
  }

  if (error === "forbidden") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">Staff access only</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Signed in as {user?.email}, but your role is not authorized for the admin console.
          Members should use the member dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/member"
            className="rounded-full bg-[#2F4F3A] px-4 py-2 text-sm font-medium text-white"
          >
            Member area
          </Link>
          <Link href="/login?redirect=/admin" className="rounded-full border px-4 py-2 text-sm">
            Sign in with another account
          </Link>
        </div>
      </main>
    );
  }

  if (error === "forbidden-path" && user) {
    return (
      <AdminShell role={user.role} email={user.email} name={user.name}>
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Your role cannot open this page. Use the sidebar to navigate to an allowed section.
        </p>
      </AdminShell>
    );
  }

  if (error || !user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-red-600">{error ?? "Not signed in"}</p>
        <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="mt-4 inline-block text-[#2F4F3A] underline">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <AdminShell role={user.role} email={user.email} name={user.name}>
      {children}
    </AdminShell>
  );
}
