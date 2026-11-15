import { Prisma, ProgramCategory, SubscriptionBasis } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function listPrograms(activeOnly = false) {
  return prisma.program.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ isActive: "desc" }, { title: "asc" }],
  });
}

export async function createProgram(data: {
  code: string;
  title: string;
  description?: string;
  category?: ProgramCategory;
  defaultFee?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}) {
  return prisma.program.create({
    data: {
      code: data.code.trim().toUpperCase(),
      title: data.title.trim(),
      category: data.category ?? ProgramCategory.TRAINING_PROGRAMME,
      description: data.description?.trim() || null,
      defaultFee:
        data.defaultFee !== undefined ? new Prisma.Decimal(data.defaultFee) : null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateProgram(
  id: string,
  data: Partial<{
    code: string;
    title: string;
    description: string | null;
    defaultFee: number | null;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
  }>,
) {
  return prisma.program.update({
    where: { id },
    data: {
      ...(data.code !== undefined ? { code: data.code.trim().toUpperCase() } : {}),
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.defaultFee !== undefined
        ? { defaultFee: data.defaultFee === null ? null : new Prisma.Decimal(data.defaultFee) }
        : {}),
      ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
}

export async function listEvents(activeOnly = false) {
  return prisma.event.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ isActive: "desc" }, { eventDate: "desc" }],
    include: { program: { select: { code: true, title: true } } },
  });
}

export async function createEvent(data: {
  code: string;
  title: string;
  description?: string;
  programId?: string;
  eventDate?: Date;
  venue?: string;
  defaultFee?: number;
  memberFee?: number;
  nonMemberFee?: number;
  registrationOpen?: boolean;
  registrationClosesAt?: Date;
  isActive?: boolean;
}) {
  return prisma.event.create({
    data: {
      code: data.code.trim().toUpperCase(),
      title: data.title.trim(),
      description: data.description?.trim() || null,
      programId: data.programId || null,
      eventDate: data.eventDate ?? null,
      venue: data.venue?.trim() || null,
      defaultFee:
        data.defaultFee !== undefined ? new Prisma.Decimal(data.defaultFee) : null,
      memberFee:
        data.memberFee !== undefined ? new Prisma.Decimal(data.memberFee) : null,
      nonMemberFee:
        data.nonMemberFee !== undefined ? new Prisma.Decimal(data.nonMemberFee) : null,
      registrationOpen: data.registrationOpen ?? false,
      registrationClosesAt: data.registrationClosesAt ?? null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateEvent(
  id: string,
  data: Partial<{
    code: string;
    title: string;
    description: string | null;
    programId: string | null;
    eventDate: Date | null;
    venue: string | null;
    defaultFee: number | null;
    memberFee: number | null;
    nonMemberFee: number | null;
    registrationOpen: boolean;
    registrationClosesAt: Date | null;
    isActive: boolean;
  }>,
) {
  return prisma.event.update({
    where: { id },
    data: {
      ...(data.code !== undefined ? { code: data.code.trim().toUpperCase() } : {}),
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.programId !== undefined ? { programId: data.programId } : {}),
      ...(data.eventDate !== undefined ? { eventDate: data.eventDate } : {}),
      ...(data.venue !== undefined ? { venue: data.venue } : {}),
      ...(data.defaultFee !== undefined
        ? { defaultFee: data.defaultFee === null ? null : new Prisma.Decimal(data.defaultFee) }
        : {}),
      ...(data.memberFee !== undefined
        ? { memberFee: data.memberFee === null ? null : new Prisma.Decimal(data.memberFee) }
        : {}),
      ...(data.nonMemberFee !== undefined
        ? {
            nonMemberFee:
              data.nonMemberFee === null ? null : new Prisma.Decimal(data.nonMemberFee),
          }
        : {}),
      ...(data.registrationOpen !== undefined ? { registrationOpen: data.registrationOpen } : {}),
      ...(data.registrationClosesAt !== undefined
        ? { registrationClosesAt: data.registrationClosesAt }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
}

export async function listSubscriptionPlans(activeOnly = false) {
  return prisma.subscriptionPlan.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ isActive: "desc" }, { title: "asc" }],
    include: {
      program: { select: { code: true, title: true } },
      event: { select: { code: true, title: true } },
    },
  });
}

export async function createSubscriptionPlan(data: {
  code: string;
  title: string;
  basis: SubscriptionBasis;
  programId?: string;
  eventId?: string;
  durationMonths?: number;
  fee: number;
  isActive?: boolean;
}) {
  return prisma.subscriptionPlan.create({
    data: {
      code: data.code.trim().toUpperCase(),
      title: data.title.trim(),
      basis: data.basis,
      programId: data.programId || null,
      eventId: data.eventId || null,
      durationMonths: data.durationMonths ?? 12,
      fee: new Prisma.Decimal(data.fee),
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateSubscriptionPlan(
  id: string,
  data: Partial<{
    code: string;
    title: string;
    basis: SubscriptionBasis;
    programId: string | null;
    eventId: string | null;
    durationMonths: number;
    fee: number;
    isActive: boolean;
  }>,
) {
  return prisma.subscriptionPlan.update({
    where: { id },
    data: {
      ...(data.code !== undefined ? { code: data.code.trim().toUpperCase() } : {}),
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.basis !== undefined ? { basis: data.basis } : {}),
      ...(data.programId !== undefined ? { programId: data.programId } : {}),
      ...(data.eventId !== undefined ? { eventId: data.eventId } : {}),
      ...(data.durationMonths !== undefined ? { durationMonths: data.durationMonths } : {}),
      ...(data.fee !== undefined ? { fee: new Prisma.Decimal(data.fee) } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
}
