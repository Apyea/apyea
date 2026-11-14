-- CreateEnum
CREATE TYPE "EventRegistrationStatus" AS ENUM ('SUBMITTED', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- AlterTable events
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "registration_open" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "registration_closes_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "events_registration_open_is_active_idx" ON "events"("registration_open", "is_active");

-- AlterTable payment_records
ALTER TABLE "payment_records" ADD COLUMN IF NOT EXISTS "event_registration_id" TEXT;

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "registration_reference" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT,
    "member_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'ONLINE',
    "registration_status" "EventRegistrationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "payment_status" "MembershipPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "admin_remarks" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_registrations_registration_reference_key" ON "event_registrations"("registration_reference");
CREATE INDEX "event_registrations_event_id_registration_status_idx" ON "event_registrations"("event_id", "registration_status");
CREATE INDEX "event_registrations_payment_status_submitted_at_idx" ON "event_registrations"("payment_status", "submitted_at");
CREATE INDEX "event_registrations_email_event_id_idx" ON "event_registrations"("email", "event_id");

ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_event_registration_id_fkey" FOREIGN KEY ("event_registration_id") REFERENCES "event_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;