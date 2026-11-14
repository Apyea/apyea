import {
  ExpenseCategory,
  ExpenseVoucherStatus,
  PaymentMethod,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateVoucherNumber } from "@/lib/finance/references";
import { logAudit } from "@/lib/membership/workflow";

export type ExpenseVoucherInput = {
  expenseCategory: ExpenseCategory;
  expenseDate: Date;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidTo: string;
  transactionRef?: string;
  supportingBillNo?: string;
  supportingBillFileId?: string;
  programId?: string;
  remarks?: string;
};

export async function createExpenseVoucher(
  input: ExpenseVoucherInput,
  enteredByUserId?: string,
) {
  const voucherNumber = await generateVoucherNumber();
  const voucher = await prisma.expenseVoucher.create({
    data: {
      voucherNumber,
      expenseCategory: input.expenseCategory,
      status: ExpenseVoucherStatus.SUBMITTED,
      expenseDate: input.expenseDate,
      description: input.description.trim(),
      amount: new Prisma.Decimal(input.amount),
      paymentMethod: input.paymentMethod,
      paidTo: input.paidTo.trim(),
      transactionRef: input.transactionRef?.trim() || null,
      supportingBillNo: input.supportingBillNo?.trim() || null,
      supportingBillFileId: input.supportingBillFileId || null,
      programId: input.programId || null,
      remarks: input.remarks?.trim() || null,
      enteredByUserId: enteredByUserId ?? null,
    },
  });
  await logAudit("EXPENSE_CREATED", "ExpenseVoucher", voucher.id, {}, enteredByUserId);
  return voucher;
}

export async function updateExpenseVoucher(
  id: string,
  input: Partial<ExpenseVoucherInput>,
  actorUserId?: string,
) {
  const existing = await prisma.expenseVoucher.findUnique({ where: { id } });
  if (!existing) throw new Error("Expense voucher not found");
  if (existing.status !== ExpenseVoucherStatus.SUBMITTED) {
    throw new Error("Only submitted vouchers can be edited");
  }

  const updated = await prisma.expenseVoucher.update({
    where: { id },
    data: {
      ...(input.expenseCategory ? { expenseCategory: input.expenseCategory } : {}),
      ...(input.expenseDate ? { expenseDate: input.expenseDate } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.amount !== undefined ? { amount: new Prisma.Decimal(input.amount) } : {}),
      ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
      ...(input.paidTo !== undefined ? { paidTo: input.paidTo.trim() } : {}),
      ...(input.transactionRef !== undefined
        ? { transactionRef: input.transactionRef?.trim() || null }
        : {}),
      ...(input.supportingBillNo !== undefined
        ? { supportingBillNo: input.supportingBillNo?.trim() || null }
        : {}),
      ...(input.supportingBillFileId !== undefined
        ? { supportingBillFileId: input.supportingBillFileId || null }
        : {}),
      ...(input.programId !== undefined ? { programId: input.programId || null } : {}),
      ...(input.remarks !== undefined ? { remarks: input.remarks?.trim() || null } : {}),
    },
  });
  await logAudit("EXPENSE_UPDATED", "ExpenseVoucher", id, {}, actorUserId);
  return updated;
}

export async function approveExpenseVoucher(id: string, approvedByUserId?: string) {
  const existing = await prisma.expenseVoucher.findUnique({ where: { id } });
  if (!existing) throw new Error("Expense voucher not found");
  if (existing.status !== ExpenseVoucherStatus.SUBMITTED) {
    throw new Error("Voucher is not pending approval");
  }

  const updated = await prisma.expenseVoucher.update({
    where: { id },
    data: {
      status: ExpenseVoucherStatus.APPROVED,
      approvedByUserId: approvedByUserId ?? null,
      approvedAt: new Date(),
    },
  });
  await logAudit("EXPENSE_APPROVED", "ExpenseVoucher", id, {}, approvedByUserId);
  return updated;
}

export async function rejectExpenseVoucher(
  id: string,
  approvedByUserId?: string,
  remarks?: string,
) {
  const updated = await prisma.expenseVoucher.update({
    where: { id },
    data: {
      status: ExpenseVoucherStatus.REJECTED,
      approvedByUserId: approvedByUserId ?? null,
      approvedAt: new Date(),
      remarks: remarks ?? null,
    },
  });
  await logAudit("EXPENSE_REJECTED", "ExpenseVoucher", id, { remarks }, approvedByUserId);
  return updated;
}

export async function listExpenseVouchers(options: {
  from?: Date;
  to?: Date;
  category?: ExpenseCategory;
  status?: ExpenseVoucherStatus;
  take?: number;
}) {
  return prisma.expenseVoucher.findMany({
    where: {
      ...(options.category ? { expenseCategory: options.category } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.from || options.to
        ? {
            expenseDate: {
              ...(options.from ? { gte: options.from } : {}),
              ...(options.to ? { lte: options.to } : {}),
            },
          }
        : {}),
    },
    orderBy: { expenseDate: "desc" },
    take: options.take ?? 100,
    include: {
      program: { select: { code: true, title: true } },
      enteredBy: { select: { name: true, email: true } },
      approvedBy: { select: { name: true, email: true } },
      supportingBillFile: {
        select: {
          id: true,
          storageKey: true,
          originalFilename: true,
          mimeType: true,
        },
      },
    },
  });
}
