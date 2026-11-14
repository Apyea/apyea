import {
  MemberStatus,
  MembershipApplicationStatus,
  MembershipPaymentStatus,
  PaymentCategory,
  PaymentMethod,
  PaymentVerificationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminSetting } from "@/lib/membership/settings";
import {
  generateMembershipNumber,
  generateReceiptNumber,
} from "@/lib/membership/references";
import { provisionMemberCognitoUser } from "@/lib/cognito/provision-member";

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  payload?: unknown,
  actorUserId?: string,
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      payloadJson: payload ? (payload as Prisma.InputJsonValue) : undefined,
      actorUserId: actorUserId ?? null,
    },
  });
}

export async function queueEmailLog(
  recipientEmail: string,
  eventType: string,
  links: { membershipApplicationId?: string; memberId?: string; renewalApplicationId?: string },
  payload?: unknown,
) {
  await prisma.emailLog.create({
    data: {
      recipientEmail,
      eventType,
      status: "QUEUED",
      payloadJson: payload ? (payload as Prisma.InputJsonValue) : undefined,
      membershipApplicationId: links.membershipApplicationId ?? null,
      memberId: links.memberId ?? null,
      renewalApplicationId: links.renewalApplicationId ?? null,
    },
  });
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function approveMembershipApplication(applicationId: string, actorUserId?: string) {
  const app = await prisma.membershipApplication.findUnique({
    where: { id: applicationId },
    include: { member: true },
  });
  if (!app) throw new Error("Application not found");
  if (app.member) {
    if (!app.member.userId) {
      await provisionMemberCognitoUser({
        memberId: app.member.id,
        email: app.email,
        mobile: app.mobile,
        fullName: app.fullName,
        sendInvite: true,
      });
    }
    return (
      (await prisma.member.findUnique({
        where: { id: app.member.id },
        include: { user: true },
      })) ?? app.member
    );
  }
  if (app.applicationStatus !== MembershipApplicationStatus.VERIFIED) {
    throw new Error("Application must be verified before approval");
  }
  if (app.paymentStatus !== MembershipPaymentStatus.VERIFIED) {
    throw new Error("Payment must be verified before approval");
  }

  const validityMonths = await getAdminSetting("membershipValidityMonths", 12);
  const membershipNumber = await generateMembershipNumber();
  const start = new Date();
  const expiry = addMonths(start, validityMonths);

  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.member.create({
      data: {
        membershipNumber,
        membershipApplicationId: app.id,
        fullName: app.fullName,
        email: app.email,
        mobile: app.mobile,
        photoFileId: app.photoFileId,
        identityProofFileId: app.identityProofFileId,
        membershipType: app.highestYogaQualificationLevelId,
        membershipStatus: MemberStatus.ACTIVE,
        approvalDate: start,
        membershipStartDate: start,
        membershipExpiryDate: expiry,
        renewalEnabled: false,
      },
    });

    await tx.membershipApplication.update({
      where: { id: app.id },
      data: {
        applicationStatus: MembershipApplicationStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedByUserId: actorUserId ?? null,
      },
    });

    await tx.paymentRecord.updateMany({
      where: { membershipApplicationId: app.id },
      data: { memberId: created.id },
    });

    return created;
  });

  await provisionMemberCognitoUser({
    memberId: member.id,
    email: app.email,
    mobile: app.mobile,
    fullName: app.fullName,
    sendInvite: true,
  });

  await logAudit("MEMBERSHIP_APPROVED", "Member", member.id, { applicationId }, actorUserId);
  await queueEmailLog(app.email, "MEMBERSHIP_APPROVED", {
    membershipApplicationId: app.id,
    memberId: member.id,
  });

  const linked = await prisma.member.findUnique({
    where: { id: member.id },
    include: { user: true },
  });
  return linked ?? member;
}

export async function verifyMembershipPayment(
  applicationId: string,
  actorUserId?: string,
  remarks?: string,
) {
  const app = await prisma.membershipApplication.findUnique({ where: { id: applicationId } });
  if (!app) throw new Error("Application not found");

  const duplicate = await prisma.paymentRecord.findFirst({
    where: {
      paymentReference: app.paymentReference,
      verificationStatus: PaymentVerificationStatus.VERIFIED,
      NOT: { membershipApplicationId: app.id },
    },
  });
  if (duplicate) {
    throw new Error("Duplicate payment reference already verified on another record");
  }

  const receiptNumber = await generateReceiptNumber();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.paymentRecord.findFirst({
      where: { membershipApplicationId: app.id },
    });

    if (existing) {
      await tx.paymentRecord.update({
        where: { id: existing.id },
        data: {
          verificationStatus: PaymentVerificationStatus.VERIFIED,
          verifiedByUserId: actorUserId ?? null,
          verifiedAt: new Date(),
          remarks: remarks ?? null,
        },
      });
    } else {
      await tx.paymentRecord.create({
        data: {
          receiptNumber,
          membershipApplicationId: app.id,
          name: app.fullName,
          mobile: app.mobile,
          address: app.addressLine,
          paymentDate: app.paymentDate,
          paymentReference: app.paymentReference,
          amountPaid: app.amountPaid,
          paymentCategory: PaymentCategory.MEMBERSHIP_FEE,
          paymentMethod: app.paymentMethod,
          applicationRefNo: app.applicationReference,
          verificationStatus: PaymentVerificationStatus.VERIFIED,
          verifiedByUserId: actorUserId ?? null,
          verifiedAt: new Date(),
          remarks: remarks ?? null,
        },
      });
    }

    await tx.membershipApplication.update({
      where: { id: app.id },
      data: {
        paymentStatus: MembershipPaymentStatus.VERIFIED,
        applicationStatus:
          app.applicationStatus === MembershipApplicationStatus.SUBMITTED
            ? MembershipApplicationStatus.PENDING_PAYMENT_VERIFICATION
            : app.applicationStatus,
      },
    });
  });

  await logAudit("PAYMENT_VERIFIED", "MembershipApplication", applicationId, {}, actorUserId);
}

export async function markMembershipInformationVerified(applicationId: string, actorUserId?: string) {
  await prisma.membershipApplication.update({
    where: { id: applicationId },
    data: {
      applicationStatus: MembershipApplicationStatus.PENDING_INFORMATION_VERIFICATION,
      reviewedByUserId: actorUserId ?? null,
      reviewedAt: new Date(),
    },
  });
  await logAudit("INFO_REVIEW_STARTED", "MembershipApplication", applicationId, {}, actorUserId);
}

export async function markMembershipVerified(applicationId: string, actorUserId?: string) {
  const app = await prisma.membershipApplication.findUnique({ where: { id: applicationId } });
  if (!app) throw new Error("Application not found");
  if (app.paymentStatus !== MembershipPaymentStatus.VERIFIED) {
    throw new Error("Verify payment before marking application verified");
  }

  await prisma.membershipApplication.update({
    where: { id: applicationId },
    data: {
      applicationStatus: MembershipApplicationStatus.VERIFIED,
      reviewedByUserId: actorUserId ?? null,
      reviewedAt: new Date(),
    },
  });
  await logAudit("APPLICATION_VERIFIED", "MembershipApplication", applicationId, {}, actorUserId);
}

export async function rejectMembershipApplication(
  applicationId: string,
  adminRemarks: string,
  actorUserId?: string,
) {
  const app = await prisma.membershipApplication.update({
    where: { id: applicationId },
    data: {
      applicationStatus: MembershipApplicationStatus.REJECTED,
      adminRemarks,
      reviewedByUserId: actorUserId ?? null,
      reviewedAt: new Date(),
    },
  });
  await logAudit(
    "APPLICATION_REJECTED",
    "MembershipApplication",
    applicationId,
    { adminRemarks },
    actorUserId,
  );
  await queueEmailLog(
    app.email,
    "MEMBERSHIP_REJECTED",
    { membershipApplicationId: app.id },
    { reason: adminRemarks },
  );
  return app;
}
