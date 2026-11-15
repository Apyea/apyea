import { prisma } from "@/lib/db";
import { decimalToNumber } from "@/lib/events/workflow";
import { PROGRAM_CATEGORY_LABELS } from "@/lib/finance/program-labels";

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
    include: { program: { select: { title: true, category: true } } },
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
      memberFee: decimalToNumber(e.memberFee),
      nonMemberFee: decimalToNumber(e.nonMemberFee),
      programTitle: e.program?.title ?? null,
      programCategory: e.program?.category
        ? PROGRAM_CATEGORY_LABELS[e.program.category]
        : null,
      registrationClosesAt: e.registrationClosesAt,
    }));
}

export async function getPublicEvent(id: string) {
  const e = await prisma.event.findUnique({
    where: { id },
    include: { program: { select: { title: true, category: true } } },
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
    memberFee: decimalToNumber(e.memberFee),
    nonMemberFee: decimalToNumber(e.nonMemberFee),
    programTitle: e.program?.title ?? null,
    programCategory: e.program?.category
      ? PROGRAM_CATEGORY_LABELS[e.program.category]
      : null,
    registrationClosesAt: e.registrationClosesAt,
  };
}