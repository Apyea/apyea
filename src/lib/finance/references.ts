import { prisma } from "@/lib/db";

export async function generateVoucherNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;
  const latest = await prisma.expenseVoucher.findFirst({
    where: { voucherNumber: { startsWith: prefix } },
    orderBy: { voucherNumber: "desc" },
    select: { voucherNumber: true },
  });
  let next = 1;
  if (latest?.voucherNumber) {
    const parsed = Number.parseInt(latest.voucherNumber.slice(prefix.length), 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${prefix}${String(next).padStart(6, "0")}`;
}
