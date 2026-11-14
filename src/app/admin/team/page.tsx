import { Suspense } from "react";
import { TeamMembersManager } from "@/components/admin/team/TeamMembersManager";
import { AdminTablePageSkeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminTeamPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Our Team</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage name, designation, qualification, photo, and display order. Entries appear on the{" "}
          <a href="/team" className="font-medium text-[#2F4F3A] hover:underline">
            Our Team
          </a>{" "}
          page in display-order sequence.
        </p>
      </div>
      <Suspense fallback={<AdminTablePageSkeleton columns={5} />}>
        <TeamMembersManager />
      </Suspense>
    </div>
  );
}