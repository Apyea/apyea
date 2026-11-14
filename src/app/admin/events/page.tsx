import { Suspense } from "react";
import { EventsRegistrationSettings } from "@/components/admin/events/EventsRegistrationSettings";
import { AdminTablePageSkeleton } from "@/components/ui/skeleton";

export default function AdminEventsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Events</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Open registration for events listed in finance catalog. Public list at{" "}
          <a href="/events" className="font-medium text-[#2F4F3A] hover:underline">
            /events
          </a>
          .
        </p>
      </div>
      <Suspense fallback={<AdminTablePageSkeleton columns={3} />}>
        <EventsRegistrationSettings />
      </Suspense>
    </div>
  );
}