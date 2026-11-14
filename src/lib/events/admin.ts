import type { EventRegistrationStatus, MembershipPaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const registrationInclude = {
  event: { select: { id: true, code: true, title: true, eventDate: true } },
  member: { select: { id: true, membershipNumber: true } },
  paymentRecords: {
    select: { id: true, receiptNumber: true, verificationStatus: true },
    take: 1,
    orderBy: { createdAt: "desc" as const },
  },
} as const;

export async function listEventRegistrationsAdmin(options?: {
  q?: string;
  eventId?: string;
  registrationStatus?: EventRegistrationStatus;
  paymentStatus?: MembershipPaymentStatus;
}) {
  const q = options?.q?.trim();
  return prisma.eventRegistration.findMany({
    where: {
      ...(options?.eventId ? { eventId: options.eventId } : {}),
      ...(options?.registrationStatus ? { registrationStatus: options.registrationStatus } : {}),
      ...(options?.paymentStatus ? { paymentStatus: options.paymentStatus } : {}),
      ...(q
        ? {
            OR: [
              { registrationReference: { contains: q, mode: "insensitive" } },
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { mobile: { contains: q } },
              { paymentReference: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ submittedAt: "desc" }],
    include: registrationInclude,
  });
}

export async function getEventRegistrationAdmin(id: string) {
  return prisma.eventRegistration.findUnique({
    where: { id },
    include: {
      ...registrationInclude,
      event: {
        select: {
          id: true,
          code: true,
          title: true,
          eventDate: true,
          venue: true,
          defaultFee: true,
        },
      },
    },
  });
}

export async function listEventsForStaff() {
  return prisma.event.findMany({
    orderBy: [{ registrationOpen: "desc" }, { eventDate: "desc" }, { title: "asc" }],
    include: {
      _count: { select: { registrations: true } },
      program: { select: { title: true } },
    },
  });
}