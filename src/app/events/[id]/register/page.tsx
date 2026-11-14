import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";

export const instant = false;

type Params = { params: Promise<{ id: string }> };

export default async function EventRegisterPage({ params }: Params) {
  const { id } = await params;
  return <EventRegistrationForm eventId={id} />;
}