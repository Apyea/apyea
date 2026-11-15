import {
  PaymentCategory,
  PaymentMethod,
  PaymentVerificationStatus,
  Prisma,
  SubscriptionBasis,
  SubscriptionEnrollmentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateReceiptNumber } from "@/lib/membership/references";
import { logAudit } from "@/lib/membership/workflow";

export type ManualIncomeInput = {
  name: string;
  mobile: string;
  address: string;
  paymentDate: Date;
  paymentReference?: string;
  needByDate?: Date;
  amountPaid: number;
  paymentCategory: PaymentCategory;
  paymentMethod: PaymentMethod;
  purposeOfRemittance?: string;
  panOfRemitter?: string;
  memberId?: string;
  programId?: string;
  eventId?: string;
  subscriptionBasis?: SubscriptionBasis;
  subscriptionPlanId?: string;
};

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const MANUAL_CATEGORIES: PaymentCategory[] = [
  PaymentCategory.DONATION,
  PaymentCategory.PROGRAM_FEE,
  PaymentCategory.EVENT_FEE,
  PaymentCategory.SUBSCRIPTION_FEE,
];

export async function createManualIncome(
  input: ManualIncomeInput,
  actorUserId?: string,
  autoVerify = true,
) {
  if (!MANUAL_CATEGORIES.includes(input.paymentCategory)) {
    throw new Error("Invalid income category for manual entry");
  }

  const ref = input.paymentReference?.trim() ?? "";
  if (ref) {
    const duplicate = await prisma.paymentRecord.findFirst({
      where: {
        paymentReference: ref,
        verificationStatus: PaymentVerificationStatus.VERIFIED,
      },
    });
    if (duplicate) {
      throw new Error("Payment reference already verified on another receipt");
    }
  }

  const receiptNumber = autoVerify ? await generateReceiptNumber() : null;
  let subscriptionEnrollmentId: string | undefined;

  if (
    input.paymentCategory === PaymentCategory.SUBSCRIPTION_FEE &&
    input.subscriptionPlanId
  ) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: input.subscriptionPlanId },
    });
    if (!plan || !plan.isActive) throw new Error("Subscription plan not found");

    const start = input.paymentDate;
    const end = addMonths(start, plan.durationMonths);
    const enrollment = await prisma.subscriptionEnrollment.create({
      data: {
        planId: plan.id,
        memberId: input.memberId ?? null,
        payerName: input.name.trim(),
        payerMobile: input.mobile.trim(),
        payerEmail: null,
        programId: plan.programId,
        eventId: plan.eventId,
        startDate: start,
        endDate: end,
        status: SubscriptionEnrollmentStatus.ACTIVE,
      },
    });
    subscriptionEnrollmentId = enrollment.id;
  }

  const record = await prisma.paymentRecord.create({
    data: {
      receiptNumber,
      name: input.name.trim(),
      mobile: input.mobile.trim(),
      address: input.address.trim(),
      paymentDate: input.paymentDate,
      needByDate: input.needByDate ?? null,
      paymentReference: ref || null,
      amountPaid: new Prisma.Decimal(input.amountPaid),
      paymentCategory: input.paymentCategory,
      paymentMethod: input.paymentMethod,
      purposeOfRemittance: input.purposeOfRemittance?.trim() || null,
      panOfRemitter: input.panOfRemitter?.trim() || null,
      memberId: input.memberId ?? null,
      programId: input.programId ?? null,
      eventId: input.eventId ?? null,
      subscriptionBasis: input.subscriptionBasis ?? null,
      subscriptionEnrollmentId: subscriptionEnrollmentId ?? null,
      verificationStatus: autoVerify
        ? PaymentVerificationStatus.VERIFIED
        : PaymentVerificationStatus.PENDING,
      verifiedByUserId: autoVerify ? (actorUserId ?? null) : null,
      verifiedAt: autoVerify ? new Date() : null,
    },
  });

  await logAudit("MANUAL_INCOME_CREATED", "PaymentRecord", record.id, { input }, actorUserId);
  return record;
}

export async function updateManualIncome(
  paymentRecordId: string,
  input: Partial<ManualIncomeInput>,
  actorUserId?: string,
) {
  const record = await prisma.paymentRecord.findUnique({ where: { id: paymentRecordId } });
  if (!record) throw new Error("Payment record not found");
  if (record.verificationStatus !== PaymentVerificationStatus.PENDING) {
    throw new Error("Only pending income records can be edited");
  }

  const ref = input.paymentReference !== undefined ? (input.paymentReference?.trim() ?? "") : undefined;
  if (ref) {
    const duplicate = await prisma.paymentRecord.findFirst({
      where: {
        paymentReference: ref,
        verificationStatus: PaymentVerificationStatus.VERIFIED,
        NOT: { id: paymentRecordId },
      },
    });
    if (duplicate) throw new Error("Payment reference already verified on another receipt");
  }

  const updated = await prisma.paymentRecord.update({
    where: { id: paymentRecordId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.mobile !== undefined ? { mobile: input.mobile.trim() } : {}),
      ...(input.address !== undefined ? { address: input.address.trim() } : {}),
      ...(input.paymentDate ? { paymentDate: input.paymentDate } : {}),
      ...(input.needByDate !== undefined ? { needByDate: input.needByDate ?? null } : {}),
      ...(ref !== undefined ? { paymentReference: ref || null } : {}),
      ...(input.amountPaid !== undefined
        ? { amountPaid: new Prisma.Decimal(input.amountPaid) }
        : {}),
      ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
      ...(input.paymentCategory ? { paymentCategory: input.paymentCategory } : {}),
      ...(input.purposeOfRemittance !== undefined
        ? { purposeOfRemittance: input.purposeOfRemittance?.trim() || null }
        : {}),
      ...(input.programId !== undefined ? { programId: input.programId || null } : {}),
      ...(input.eventId !== undefined ? { eventId: input.eventId || null } : {}),
    },
  });
  await logAudit("MANUAL_INCOME_UPDATED", "PaymentRecord", paymentRecordId, {}, actorUserId);
  return updated;
}

export async function verifyManualIncome(
  paymentRecordId: string,
  actorUserId?: string,
  remarks?: string,
) {
  const record = await prisma.paymentRecord.findUnique({ where: { id: paymentRecordId } });
  if (!record) throw new Error("Payment record not found");
  if (record.verificationStatus === PaymentVerificationStatus.VERIFIED) {
    return record;
  }

  const receiptNumber = record.receiptNumber ?? (await generateReceiptNumber());

  const updated = await prisma.paymentRecord.update({
    where: { id: paymentRecordId },
    data: {
      receiptNumber,
      verificationStatus: PaymentVerificationStatus.VERIFIED,
      verifiedByUserId: actorUserId ?? null,
      verifiedAt: new Date(),
      remarks: remarks ?? record.remarks,
    },
  });

  await logAudit("INCOME_VERIFIED", "PaymentRecord", paymentRecordId, {}, actorUserId);
  return updated;
}

export async function rejectManualIncome(
  paymentRecordId: string,
  actorUserId?: string,
  remarks?: string,
) {
  const updated = await prisma.paymentRecord.update({
    where: { id: paymentRecordId },
    data: {
      verificationStatus: PaymentVerificationStatus.REJECTED,
      verifiedByUserId: actorUserId ?? null,
      verifiedAt: new Date(),
      remarks: remarks ?? null,
    },
  });
  await logAudit("INCOME_REJECTED", "PaymentRecord", paymentRecordId, { remarks }, actorUserId);
  return updated;
}

export async function listIncomeRecords(options: {
  from?: Date;
  to?: Date;
  category?: PaymentCategory;
  status?: PaymentVerificationStatus;
  take?: number;
}) {
  return prisma.paymentRecord.findMany({
    where: {
      ...(options.category ? { paymentCategory: options.category } : {}),
      ...(options.status ? { verificationStatus: options.status } : {}),
      ...(options.from || options.to
        ? {
            paymentDate: {
              ...(options.from ? { gte: options.from } : {}),
              ...(options.to ? { lte: options.to } : {}),
            },
          }
        : {}),
    },
    orderBy: { paymentDate: "desc" },
    take: options.take ?? 100,
    include: {
      program: { select: { code: true, title: true } },
      event: { select: { code: true, title: true } },
      member: { select: { membershipNumber: true } },
    },
  });
}
