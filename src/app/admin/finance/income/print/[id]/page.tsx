import { notFound } from "next/navigation";
import { PaymentVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PAYMENT_CATEGORY_LABELS } from "@/lib/finance/labels";

export default async function PrintIncomeReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.paymentRecord.findUnique({ where: { id } });
  if (
    !record ||
    record.verificationStatus !== PaymentVerificationStatus.VERIFIED ||
    !record.receiptNumber
  ) {
    notFound();
  }

  return (
    <html lang="en">
      <head>
        <title>{`Receipt ${record.receiptNumber}`}</title>
        <style>{`
          body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; color: #1e2e24; }
          h1 { font-size: 1.25rem; }
          dl { display: grid; grid-template-columns: 10rem 1fr; gap: 0.35rem 1rem; font-size: 0.95rem; }
          dt { font-weight: 600; }
          @media print { button { display: none; } }
        `}</style>
      </head>
      <body>
        <h1>APYEA — Income receipt</h1>
        <p>
          Receipt No: <strong>{record.receiptNumber}</strong>
        </p>
        <dl>
          <dt>Payer</dt>
          <dd>{record.name}</dd>
          <dt>Mobile</dt>
          <dd>{record.mobile}</dd>
          <dt>Category</dt>
          <dd>{PAYMENT_CATEGORY_LABELS[record.paymentCategory]}</dd>
          <dt>Payment date</dt>
          <dd>{record.paymentDate.toLocaleDateString("en-IN")}</dd>
          <dt>Amount</dt>
          <dd>₹{Number(record.amountPaid).toLocaleString("en-IN")}</dd>
          {record.paymentReference ? (
            <>
              <dt>Reference</dt>
              <dd>{record.paymentReference}</dd>
            </>
          ) : null}
          {record.purposeOfRemittance ? (
            <>
              <dt>Purpose</dt>
              <dd>{record.purposeOfRemittance}</dd>
            </>
          ) : null}
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