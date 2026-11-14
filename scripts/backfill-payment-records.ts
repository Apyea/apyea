/**
 * Creates missing PaymentRecord rows for membership applications with verified payment
 * but no linked receipt (one-off migration aid).
 *
 *   npx tsx scripts/backfill-payment-records.ts
 */
import "dotenv/config";
import { PaymentCategory, PaymentMethod, PaymentVerificationStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { generateReceiptNumber } from "../src/lib/membership/references";

async function main() {
  const apps = await prisma.membershipApplication.findMany({
    where: { paymentStatus: "VERIFIED" },
    include: { paymentRecords: true },
  });

  let created = 0;
  for (const app of apps) {
    if (app.paymentRecords.length > 0) continue;

    const receiptNumber = await generateReceiptNumber();
    await prisma.paymentRecord.create({
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
        paymentMethod: app.paymentMethod ?? PaymentMethod.ONLINE,
        applicationRefNo: app.applicationReference,
        verificationStatus: PaymentVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
      },
    });
    created += 1;
    console.log(`Backfilled ${app.applicationReference}`);
  }

  console.log(`Done. Created ${created} payment record(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
