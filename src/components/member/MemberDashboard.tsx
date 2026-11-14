"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppMain } from "@/components/layout/AppMain";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";
import { isStaffRole } from "@/lib/auth/staff-roles";
import { SecondaryButton } from "@/components/ui/form-primitives";
import { MemberDashboardSkeleton } from "@/components/ui/skeleton";

type Session = {
  user: { id: string; email: string; name: string | null; role: string };
  member: {
    id: string;
    membershipNumber: string;
    membershipStatus: string;
    membershipStartDate: string;
    membershipExpiryDate: string;
    fullName: string;
    email: string;
    mobile: string;
  } | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MemberShell({
  children,
  session,
  onSignOut,
}: {
  children: React.ReactNode;
  session: Session | null;
  onSignOut: () => void;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAF7F2]">
      <PublicSiteHeader />
      <AppTopBar
        showLogo={false}
        user={
          session
            ? { email: session.user.email, name: session.user.name }
            : undefined
        }
        profileSubtitle="Member"
        onSignOut={onSignOut}
      />
      <AppMain width="narrow">{children}</AppMain>
    </div>
  );
}

export function MemberDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login?redirect=/member");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load profile");
      setSession(data);
      const staffRoles = ["ADMIN", "EXECUTIVE_MANAGER", "OPERATIONAL_MANAGER"];
      if (staffRoles.includes(data.user?.role) && !data.member) {
        router.replace("/admin");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <MemberShell session={null} onSignOut={() => void signOut()}>
        <MemberDashboardSkeleton />
      </MemberShell>
    );
  }

  if (error) {
    return (
      <MemberShell session={session} onSignOut={() => void signOut()}>
        <p className="text-sm text-red-600">{error}</p>
        <SecondaryButton type="button" className="mt-4 w-auto" onClick={() => void load()}>
          Retry
        </SecondaryButton>
      </MemberShell>
    );
  }

  const member = session?.member;
  const showAdmin =
    session?.user.role && isStaffRole(session.user.role);

  return (
    <MemberShell session={session} onSignOut={() => void signOut()}>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#1E2E24]/8">
        <div>
          <h1 className="text-xl font-bold text-[#1B3D32]">Member dashboard</h1>
          <p className="mt-1 text-sm text-[#5F7A66]">
            {member?.fullName ?? session?.user.name ?? "Your APYEA membership"}
          </p>
        </div>

        {!member ? (
          <div className="mt-6 rounded-xl bg-[#FAF7F2] p-4 text-sm text-[#5F7A66]">
            Your Cognito account is active, but no APYEA membership is linked yet. If you were
            recently approved, try signing out and back in. Otherwise contact APYEA support.
            <div className="mt-4">
              <Link href="/membership/apply" className="font-medium text-[#2F4F3A] hover:underline">
                Apply for membership
              </Link>
            </div>
          </div>
        ) : (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
                Membership no.
              </dt>
              <dd className="mt-1 text-lg font-semibold text-[#1B3D32]">
                {member.membershipNumber}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
                Status
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#1E2E24]">{member.membershipStatus}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
                Valid from
              </dt>
              <dd className="mt-1 text-sm text-[#1E2E24]">
                {formatDate(member.membershipStartDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
                Valid until
              </dt>
              <dd className="mt-1 text-sm text-[#1E2E24]">
                {formatDate(member.membershipExpiryDate)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
                Name
              </dt>
              <dd className="mt-1 text-sm text-[#1E2E24]">{member.fullName}</dd>
            </div>
          </dl>
        )}

        <div className="mt-6 rounded-xl bg-[#FAF7F2] p-4">
          <p className="text-sm font-medium text-[#1B3D32]">Events</p>
          <p className="mt-1 text-sm text-[#5F7A66]">
            Register for workshops and programs with your member account.
          </p>
          <Link
            href="/events"
            className="mt-3 inline-flex text-sm font-semibold text-[#2F4F3A] hover:underline"
          >
            Browse open events →
          </Link>
        </div>

        {showAdmin ? (
          <Link
            href="/admin"
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#2F4F3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B3D32] sm:w-auto"
          >
            Open admin console
          </Link>
        ) : null}
      </div>
    </MemberShell>
  );
}
