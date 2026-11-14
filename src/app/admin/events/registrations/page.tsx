import { Suspense } from "react";
import { EventRegistrationsTable } from "@/components/admin/events/EventRegistrationsTable";
import { AdminTablePageSkeleton } from "@/components/ui/skeleton";

type Props = { searchParams: Promise<{ eventId?: string }> };

export default async function AdminEventRegistrationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Event registrations</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Verify payments to confirm participants. Verified fees count as EVENT_FEE income.
        </p>
      </div>
      <Suspense fallback={<AdminTablePageSkeleton columns={6} />}>
        <EventRegistrationsTable initialEventId={sp.eventId} />
      </Suspense>
    </div>
  );
}