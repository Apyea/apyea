import { notFound } from "next/navigation";
import { ExpenseVoucherStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/finance/labels";

export default async function PrintExpenseVoucherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voucher = await prisma.expenseVoucher.findUnique({ where: { id } });
  if (
    !voucher ||
    voucher.status !== ExpenseVoucherStatus.APPROVED ||
    !voucher.voucherNumber
  ) {
    notFound();
  }

  return (
    <html lang="en">
      <head>
        <title>{`Voucher ${voucher.voucherNumber}`}</title>
        <style>{`
          body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; color: #1e2e24; }
          h1 { font-size: 1.25rem; }
          dl { display: grid; grid-template-columns: 10rem 1fr; gap: 0.35rem 1rem; font-size: 0.95rem; }
          dt { font-weight: 600; }
        `}</style>
      </head>
      <body>
        <h1>APYEA — Expenditure voucher</h1>
        <p>
          Voucher No: <strong>{voucher.voucherNumber}</strong>
        </p>
        <dl>
          <dt>Paid to</dt>
          <dd>{voucher.paidTo}</dd>
          <dt>Category</dt>
          <dd>{EXPENSE_CATEGORY_LABELS[voucher.expenseCategory]}</dd>
          <dt>Expense date</dt>
          <dd>{voucher.expenseDate.toLocaleDateString("en-IN")}</dd>
          <dt>Amount</dt>
          <dd>₹{Number(voucher.amount).toLocaleString("en-IN")}</dd>
          <dt>Description</dt>
          <dd>{voucher.description}</dd>
        </dl>
        <script
          dangerouslySetInnerHTML={{
            __html: "window.addEventListener('load', () => { setTimeout(() => window.print(), 300); });",
          }}
        />
      </body>
    </html>
  );
}