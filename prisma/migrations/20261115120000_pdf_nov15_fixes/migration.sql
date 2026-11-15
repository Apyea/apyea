-- Program category + programme fees
CREATE TYPE "ProgramCategory" AS ENUM ('TRAINING_PROGRAMME', 'WORKSHOP', 'SEMINAR', 'CONFERENCE', 'OTHER');

ALTER TABLE "programs" ADD COLUMN "category" "ProgramCategory" NOT NULL DEFAULT 'TRAINING_PROGRAMME';

ALTER TABLE "events" ADD COLUMN "member_fee" DECIMAL(12,2);
ALTER TABLE "events" ADD COLUMN "non_member_fee" DECIMAL(12,2);

-- Membership optional subscription + teacher interest
ALTER TABLE "membership_applications" ADD COLUMN "subscription_plan_id" TEXT;
ALTER TABLE "membership_applications" ADD COLUMN "teacher_interest_json" JSONB;

ALTER TABLE "membership_applications"
  ADD CONSTRAINT "membership_applications_subscription_plan_id_fkey"
  FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "event_registrations" ADD COLUMN "teacher_interest_json" JSONB;

-- Manual income / vouchers: pending receipt & voucher numbers, need-by
ALTER TABLE "payment_records" ALTER COLUMN "receipt_number" DROP NOT NULL;
ALTER TABLE "payment_records" ALTER COLUMN "payment_reference" DROP NOT NULL;
ALTER TABLE "payment_records" ADD COLUMN "need_by_date" DATE;

ALTER TABLE "expense_vouchers" ALTER COLUMN "voucher_number" DROP NOT NULL;
ALTER TABLE "expense_vouchers" ADD COLUMN "need_by_date" DATE;