import { prisma } from "@/lib/db";
import { decimalToNumber } from "@/lib/events/workflow";

export function eventIsOpenForRegistration(event: {
  isActive: boolean;
  registrationOpen: boolean;
  registrationClosesAt: Date | null;
}) {
  if (!event.isActive || !event.registrationOpen) return false;
  if (event.registrationClosesAt && event.registrationClosesAt < new Date()) return false;
  return true;
}

export async function listPublicEvents() {
  const events = await prisma.event.findMany({
    where: { isActive: true, registrationOpen: true },
    orderBy: [{ eventDate: "asc" }, { title: "asc" }],
    include: { program: { select: { title: true } } },
  });
  return events
    .filter((e) => eventIsOpenForRegistration(e))
    .map((e) => ({
      id: e.id,
      code: e.code,
      title: e.title,
      description: e.description,
      eventDate: e.eventDate,
      venue: e.venue,
      defaultFee: decimalToNumber(e.defaultFee),
      programTitle: e.program?.title ?? null,
      registrationClosesAt: e.registrationClosesAt,
    }));
}

export async function getPublicEvent(id: string) {
  const e = await prisma.event.findUnique({
    where: { id },
    include: { program: { select: { title: true } } },
  });
  if (!e || !eventIsOpenForRegistration(e)) return null;
  return {
    id: e.id,
    code: e.code,
    title: e.title,
    description: e.description,
    eventDate: e.eventDate,
    venue: e.venue,
    defaultFee: decimalToNumber(e.defaultFee),
    programTitle: e.program?.title ?? null,
    registrationClosesAt: e.registrationClosesAt,
  };
}