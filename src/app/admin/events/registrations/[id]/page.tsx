import { Suspense } from "react";
import { EventRegistrationReviewPanel } from "@/components/admin/events/EventRegistrationReviewPanel";
import { DetailReviewSkeleton } from "@/components/ui/skeleton";

type Params = { params: Promise<{ id: string }> };

export default async function AdminEventRegistrationReviewPage({ params }: Params) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailReviewSkeleton />}>
      <EventRegistrationReviewPanel registrationId={id} />
    </Suspense>
  );
}