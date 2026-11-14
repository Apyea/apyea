import {
  MemberStatus,
  MembershipPaymentStatus,
  PaymentCategory,
  PaymentVerificationStatus,
  Prisma,
  RenewalApplicationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateReceiptNumber, generateRenewalReference } from "@/lib/membership/references";
import { getAdminSetting } from "@/lib/membership/settings";
import { logAudit, queueEmailLog } from "@/lib/membership/workflow";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function verifyRenewalPayment(
  renewalApplicationId: string,
  actorUserId?: string,
  remarks?: string,
) {
  const app = await prisma.renewalApplication.findUnique({
    where: { id: renewalApplicationId },
    include: { member: true },
  });
  if (!app) throw new Error("Renewal application not found");

  const duplicate = await prisma.paymentRecord.findFirst({
    where: {
      paymentReference: app.paymentReference,
      verificationStatus: PaymentVerificationStatus.VERIFIED,
      NOT: { renewalApplicationId: app.id },
    },
  });
  if (duplicate) {
    throw new Error("Duplicate payment reference already verified on another record");
  }

  const receiptNumber = await generateReceiptNumber();
  const member = app.member;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.paymentRecord.findFirst({
      where: { renewalApplicationId: app.id },
    });

    if (existing) {
      await tx.paymentRecord.update({
        where: { id: existing.id },
        data: {
          verificationStatus: PaymentVerificationStatus.VERIFIED,
          verifiedByUserId: actorUserId ?? null,
          verifiedAt: new Date(),
          paymentMethod: app.paymentMethod,
          remarks: remarks ?? null,
        },
      });
    } else {
      await tx.paymentRecord.create({
        data: {
          receiptNumber,
          memberId: member.id,
          renewalApplicationId: app.id,
          name: member.fullName,
          mobile: member.mobile,
          address: "",
          paymentDate: app.paymentDate,
          paymentReference: app.paymentReference,
          amountPaid: app.renewalFee,
          paymentCategory: PaymentCategory.RENEWAL_FEE,
          paymentMethod: app.paymentMethod,
          applicationRefNo: app.renewalReference,
          verificationStatus: PaymentVerificationStatus.VERIFIED,
          verifiedByUserId: actorUserId ?? null,
          verifiedAt: new Date(),
          remarks: remarks ?? null,
        },
      });
    }

    await tx.renewalApplication.update({
      where: { id: app.id },
      data: {
        paymentStatus: MembershipPaymentStatus.VERIFIED,
        renewalStatus: RenewalApplicationStatus.PAYMENT_VERIFICATION_PENDING,
      },
    });
  });

  await logAudit("RENEWAL_PAYMENT_VERIFIED", "RenewalApplication", renewalApplicationId, {}, actorUserId);
}

export async function approveRenewalApplication(renewalApplicationId: string, actorUserId?: string) {
  const app = await prisma.renewalApplication.findUnique({
    where: { id: renewalApplicationId },
    include: { member: true },
  });
  if (!app) throw new Error("Renewal application not found");
  if (app.paymentStatus !== MembershipPaymentStatus.VERIFIED) {
    throw new Error("Payment must be verified before approval");
  }

  const validityMonths = await getAdminSetting("membershipValidityMonths", 12);
  const newStart = app.previousExpiryDate;
  const newExpiry = addMonths(newStart, validityMonths);

  await prisma.$transaction(async (tx) => {
    await tx.member.update({
      where: { id: app.memberId },
      data: {
        membershipStatus: MemberStatus.ACTIVE,
        membershipStartDate: newStart,
        membershipExpiryDate: newExpiry,
        lastRenewalApplicationId: app.id,
      },
    });

    await tx.renewalApplication.update({
      where: { id: app.id },
      data: {
        renewalStatus: RenewalApplicationStatus.APPROVED,
        newStartDate: newStart,
        newExpiryDate: newExpiry,
        reviewedAt: new Date(),
        reviewedByUserId: actorUserId ?? null,
      },
    });
  });

  await logAudit("RENEWAL_APPROVED", "RenewalApplication", renewalApplicationId, {}, actorUserId);
  await queueEmailLog(app.member.email, "RENEWAL_APPROVED", {
    memberId: app.memberId,
    renewalApplicationId: app.id,
  });
}

/** Admin / member submission helper — creates renewal application row. */
export async function submitRenewalApplication(input: {
  memberId: string;
  paymentReference: string;
  paymentDate: Date;
  renewalFee: number;
  paymentMethod?: import("@prisma/client").PaymentMethod;
}) {
  const member = await prisma.member.findUnique({ where: { id: input.memberId } });
  if (!member) throw new Error("Member not found");

  const renewalReference = await generateRenewalReference();

  return prisma.renewalApplication.create({
    data: {
      renewalReference,
      memberId: member.id,
      previousExpiryDate: member.membershipExpiryDate,
      renewalFee: new Prisma.Decimal(input.renewalFee),
      paymentReference: input.paymentReference.trim(),
      paymentDate: input.paymentDate,
      paymentMethod: input.paymentMethod ?? "ONLINE",
    },
  });
}
