import {
  ExpenseCategory,
  ExpenseVoucherStatus,
  PaymentCategory,
  PaymentMethod,
  PaymentVerificationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type FinanceSummary = {
  from: string;
  to: string;
  income: {
    total: number;
    byCategory: Record<PaymentCategory, number>;
    byMethod: Record<PaymentMethod, number>;
  };
  expenditure: {
    total: number;
    byCategory: Record<ExpenseCategory, number>;
  };
  net: number;
};

function emptyCategoryTotals<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
}

const PAYMENT_CATEGORIES = Object.values(PaymentCategory);
const PAYMENT_METHODS = Object.values(PaymentMethod);
const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export async function getFinanceSummary(from: Date, to: Date): Promise<FinanceSummary> {
  const incomeWhere = {
    verificationStatus: PaymentVerificationStatus.VERIFIED,
    paymentDate: { gte: from, lte: to },
  };

  const expenseWhere = {
    status: ExpenseVoucherStatus.APPROVED,
    expenseDate: { gte: from, lte: to },
  };

  const [incomeTotal, incomeByCategory, incomeByMethod, expenseTotal, expenseByCategory] =
    await Promise.all([
      prisma.paymentRecord.aggregate({
        where: incomeWhere,
        _sum: { amountPaid: true },
      }),
      prisma.paymentRecord.groupBy({
        by: ["paymentCategory"],
        where: incomeWhere,
        _sum: { amountPaid: true },
      }),
      prisma.paymentRecord.groupBy({
        by: ["paymentMethod"],
        where: incomeWhere,
        _sum: { amountPaid: true },
      }),
      prisma.expenseVoucher.aggregate({
        where: expenseWhere,
        _sum: { amount: true },
      }),
      prisma.expenseVoucher.groupBy({
        by: ["expenseCategory"],
        where: expenseWhere,
        _sum: { amount: true },
      }),
    ]);

  const byCategory = emptyCategoryTotals(PAYMENT_CATEGORIES);
  for (const row of incomeByCategory) {
    byCategory[row.paymentCategory] = Number(row._sum.amountPaid ?? 0);
  }

  const byMethod = emptyCategoryTotals(PAYMENT_METHODS);
  for (const row of incomeByMethod) {
    byMethod[row.paymentMethod] = Number(row._sum.amountPaid ?? 0);
  }

  const expByCategory = emptyCategoryTotals(EXPENSE_CATEGORIES);
  for (const row of expenseByCategory) {
    expByCategory[row.expenseCategory] = Number(row._sum.amount ?? 0);
  }

  const totalIncome = Number(incomeTotal._sum.amountPaid ?? 0);
  const totalExpenditure = Number(expenseTotal._sum.amount ?? 0);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    income: { total: totalIncome, byCategory, byMethod },
    expenditure: { total: totalExpenditure, byCategory: expByCategory },
    net: totalIncome - totalExpenditure,
  };
}

export function parseFinanceDateRange(searchParams: URLSearchParams): { from: Date; to: Date } {
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const now = new Date();
  if (fromStr && toStr) {
    const from = new Date(fromStr);
    const to = new Date(toStr);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      return { from, to };
    }
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from, to };
}
