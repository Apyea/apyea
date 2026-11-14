import {
  EventRegistrationStatus,
  MembershipPaymentStatus,
  PaymentCategory,
  PaymentVerificationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateReceiptNumber } from "@/lib/membership/references";
import { logAudit } from "@/lib/membership/workflow";

export async function verifyEventRegistrationPayment(
  registrationId: string,
  actorUserId?: string,
  remarks?: string,
) {
  const reg = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: { event: true },
  });
  if (!reg) throw new Error("Registration not found");
  if (reg.registrationStatus === EventRegistrationStatus.REJECTED) {
    throw new Error("Registration was rejected");
  }
  if (reg.registrationStatus === EventRegistrationStatus.CANCELLED) {
    throw new Error("Registration was cancelled");
  }

  const duplicate = await prisma.paymentRecord.findFirst({
    where: {
      paymentReference: reg.paymentReference,
      verificationStatus: PaymentVerificationStatus.VERIFIED,
      NOT: { eventRegistrationId: reg.id },
    },
  });
  if (duplicate) {
    throw new Error("Duplicate payment reference already verified on another record");
  }

  const receiptNumber = await generateReceiptNumber();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.paymentRecord.findFirst({
      where: { eventRegistrationId: reg.id },
    });

    if (existing) {
      await tx.paymentRecord.update({
        where: { id: existing.id },
        data: {
          verificationStatus: PaymentVerificationStatus.VERIFIED,
          verifiedByUserId: actorUserId ?? null,
          verifiedAt: new Date(),
          remarks: remarks ?? null,
          eventId: reg.eventId,
          memberId: reg.memberId,
        },
      });
    } else {
      await tx.paymentRecord.create({
        data: {
          receiptNumber,
          eventRegistrationId: reg.id,
          eventId: reg.eventId,
          memberId: reg.memberId,
          name: reg.fullName,
          mobile: reg.mobile,
          address: reg.addressLine,
          paymentDate: reg.paymentDate,
          paymentReference: reg.paymentReference,
          amountPaid: reg.amountPaid,
          paymentCategory: PaymentCategory.EVENT_FEE,
          paymentMethod: reg.paymentMethod,
          applicationRefNo: reg.registrationReference,
          purposeOfRemittance: reg.event.title,
          verificationStatus: PaymentVerificationStatus.VERIFIED,
          verifiedByUserId: actorUserId ?? null,
          verifiedAt: new Date(),
          remarks: remarks ?? null,
        },
      });
    }

    await tx.eventRegistration.update({
      where: { id: reg.id },
      data: {
        paymentStatus: MembershipPaymentStatus.VERIFIED,
        registrationStatus: EventRegistrationStatus.CONFIRMED,
        reviewedByUserId: actorUserId ?? null,
        reviewedAt: new Date(),
        adminRemarks: remarks ?? reg.adminRemarks,
      },
    });
  });

  await logAudit("EVENT_PAYMENT_VERIFIED", "EventRegistration", registrationId, {}, actorUserId);
}

export async function rejectEventRegistration(
  registrationId: string,
  adminRemarks: string,
  actorUserId?: string,
) {
  await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: {
      registrationStatus: EventRegistrationStatus.REJECTED,
      paymentStatus: MembershipPaymentStatus.REJECTED,
      adminRemarks: adminRemarks.trim(),
      reviewedByUserId: actorUserId ?? null,
      reviewedAt: new Date(),
    },
  });
  await logAudit(
    "EVENT_REGISTRATION_REJECTED",
    "EventRegistration",
    registrationId,
    { adminRemarks },
    actorUserId,
  );
}

export async function cancelEventRegistration(registrationId: string, actorUserId?: string) {
  await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: {
      registrationStatus: EventRegistrationStatus.CANCELLED,
      reviewedByUserId: actorUserId ?? null,
      reviewedAt: new Date(),
    },
  });
  await logAudit("EVENT_REGISTRATION_CANCELLED", "EventRegistration", registrationId, {}, actorUserId);
}

export function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  if (value == null) return null;
  return Number(value);
}