import { prisma } from "@/lib/db";
import { getAdminSetting } from "@/lib/membership/settings";

export async function generateMembershipApplicationReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `APYEA-MEM-APP-${year}-`;
  const latest = await prisma.membershipApplication.findFirst({
    where: { applicationReference: { startsWith: prefix } },
    orderBy: { applicationReference: "desc" },
    select: { applicationReference: true },
  });
  let next = 1;
  if (latest?.applicationReference) {
    const parsed = Number.parseInt(latest.applicationReference.slice(prefix.length), 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${prefix}${String(next).padStart(5, "0")}`;
}

export async function generateMembershipNumber(): Promise<string> {
  const prefix = await getAdminSetting("membershipNumberPrefix", "APYEA");
  const year = new Date().getFullYear();
  const head = `${prefix}-${year}-`;
  const latest = await prisma.member.findFirst({
    where: { membershipNumber: { startsWith: head } },
    orderBy: { membershipNumber: "desc" },
    select: { membershipNumber: true },
  });
  let next = 1;
  if (latest?.membershipNumber) {
    const parsed = Number.parseInt(latest.membershipNumber.slice(head.length), 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${head}${String(next).padStart(5, "0")}`;
}

export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RCPT-${year}-`;
  const latest = await prisma.paymentRecord.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { receiptNumber: "desc" },
    select: { receiptNumber: true },
  });
  let next = 1;
  if (latest?.receiptNumber) {
    const parsed = Number.parseInt(latest.receiptNumber.slice(prefix.length), 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${prefix}${String(next).padStart(6, "0")}`;
}

export async function generateRenewalReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `APYEA-REN-${year}-`;
  const latest = await prisma.renewalApplication.findFirst({
    where: { renewalReference: { startsWith: prefix } },
    orderBy: { renewalReference: "desc" },
    select: { renewalReference: true },
  });
  let next = 1;
  if (latest?.renewalReference) {
    const parsed = Number.parseInt(latest.renewalReference.slice(prefix.length), 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${prefix}${String(next).padStart(5, "0")}`;
}
