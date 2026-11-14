-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDUCATOR', 'OPERATIONAL_MANAGER', 'EXECUTIVE_MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SurveySubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SurveyReviewStatus" AS ENUM ('NOT_STARTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MembershipApplicationStatus" AS ENUM ('SUBMITTED', 'PENDING_INFORMATION_VERIFICATION', 'PENDING_PAYMENT_VERIFICATION', 'VERIFIED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MembershipPaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'RENEWAL_DUE');

-- CreateEnum
CREATE TYPE "RenewalApplicationStatus" AS ENUM ('SUBMITTED', 'PAYMENT_VERIFICATION_PENDING', 'VERIFIED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentCategory" AS ENUM ('MEMBERSHIP_FEE', 'RENEWAL_FEE', 'DONATION', 'PROGRAM_FEE', 'EVENT_FEE', 'SUBSCRIPTION_FEE');

-- CreateEnum
CREATE TYPE "SubscriptionBasis" AS ENUM ('MEMBERSHIP', 'PROGRAM', 'EVENT');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('RENT', 'CLOUD_CHARGES', 'PROGRAM_EXPENSE', 'STATIONARY', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "ExpenseVoucherStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionEnrollmentStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "cognito_sub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nationalities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nationalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "state_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandals" (
    "id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yoga_qualification_levels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yoga_qualification_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yoga_professional_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yoga_professional_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_statuses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employment_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gov_work_interest_options" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gov_work_interest_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_responses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecture_languages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecture_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_preference_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employment_preference_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_challenge_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_challenge_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educator_surveys" (
    "id" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,
    "name_as_per_ssc" TEXT NOT NULL,
    "father_or_husband_name" TEXT NOT NULL,
    "gender_id" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "nationality_id" TEXT NOT NULL,
    "state_id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "mandal_id" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "pincode" TEXT,
    "highest_yoga_qualification_level_id" TEXT NOT NULL,
    "yoga_qualification_institution_name" TEXT NOT NULL DEFAULT '',
    "yoga_qualification_year_of_completion" INTEGER NOT NULL DEFAULT 0,
    "highest_yoga_qualification_other_text" TEXT,
    "yoga_professional_type_id" TEXT NOT NULL,
    "experience_years" INTEGER,
    "experience_months" INTEGER,
    "experience_days" INTEGER,
    "employment_status_id" TEXT NOT NULL,
    "gov_work_interest_id" TEXT NOT NULL,
    "volunteer_response_id" TEXT NOT NULL,
    "consent_given_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "submission_status" "SurveySubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "review_status" "SurveyReviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educator_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educator_survey_yoga_qualifications" (
    "id" TEXT NOT NULL,
    "educator_survey_id" TEXT NOT NULL,
    "yoga_qualification_level_id" TEXT NOT NULL,
    "other_text" TEXT,
    "institution_name" TEXT NOT NULL,
    "year_of_completion" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "educator_survey_yoga_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educator_survey_languages" (
    "educator_survey_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "other_language_text" TEXT,

    CONSTRAINT "educator_survey_languages_pkey" PRIMARY KEY ("educator_survey_id","language_id")
);

-- CreateTable
CREATE TABLE "educator_survey_employment_preferences" (
    "educator_survey_id" TEXT NOT NULL,
    "preference_type_id" TEXT NOT NULL,

    CONSTRAINT "educator_survey_employment_preferences_pkey" PRIMARY KEY ("educator_survey_id","preference_type_id")
);

-- CreateTable
CREATE TABLE "educator_survey_challenges" (
    "educator_survey_id" TEXT NOT NULL,
    "challenge_type_id" TEXT NOT NULL,

    CONSTRAINT "educator_survey_challenges_pkey" PRIMARY KEY ("educator_survey_id","challenge_type_id")
);

-- CreateTable
CREATE TABLE "stored_files" (
    "id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "checksum_sha256" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_applications" (
    "id" TEXT NOT NULL,
    "application_reference" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "state_id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "mandal_id" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "highest_yoga_qualification_level_id" TEXT NOT NULL,
    "institute_name" TEXT NOT NULL,
    "year_of_passing" INTEGER NOT NULL,
    "highest_yoga_qualification_other_text" TEXT,
    "photo_file_id" TEXT NOT NULL,
    "identity_proof_file_id" TEXT NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'ONLINE',
    "application_status" "MembershipApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "payment_status" "MembershipPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "declaration_consent_at" TIMESTAMP(3) NOT NULL,
    "privacy_notice_version" TEXT NOT NULL,
    "educator_survey_id" TEXT,
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "admin_remarks" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_application_yoga_qualifications" (
    "id" TEXT NOT NULL,
    "membership_application_id" TEXT NOT NULL,
    "yoga_qualification_level_id" TEXT NOT NULL,
    "other_text" TEXT,
    "institution_name" TEXT NOT NULL,
    "year_of_completion" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "membership_application_yoga_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "membership_number" TEXT NOT NULL,
    "membership_application_id" TEXT NOT NULL,
    "user_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "photo_file_id" TEXT NOT NULL,
    "identity_proof_file_id" TEXT NOT NULL,
    "membership_type" TEXT,
    "membership_status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "approval_date" DATE NOT NULL,
    "membership_start_date" DATE NOT NULL,
    "membership_expiry_date" DATE NOT NULL,
    "renewal_enabled" BOOLEAN NOT NULL DEFAULT false,
    "membership_card_file_id" TEXT,
    "last_renewal_application_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_applications" (
    "id" TEXT NOT NULL,
    "renewal_reference" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previous_expiry_date" DATE NOT NULL,
    "renewal_fee" DECIMAL(12,2) NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'ONLINE',
    "renewal_status" "RenewalApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "payment_status" "MembershipPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "admin_remarks" TEXT,
    "new_start_date" DATE,
    "new_expiry_date" DATE,

    CONSTRAINT "renewal_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_records" (
    "id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "member_id" TEXT,
    "membership_application_id" TEXT,
    "renewal_application_id" TEXT,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "payment_category" "PaymentCategory" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'ONLINE',
    "subscription_basis" "SubscriptionBasis",
    "program_id" TEXT,
    "event_id" TEXT,
    "subscription_enrollment_id" TEXT,
    "pan_of_remitter" TEXT,
    "purpose_of_remittance" TEXT,
    "application_ref_no" TEXT,
    "aadhar_number" TEXT,
    "verification_status" "PaymentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_by_user_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "default_fee" DECIMAL(12,2),
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "program_id" TEXT,
    "event_date" DATE,
    "venue" TEXT,
    "default_fee" DECIMAL(12,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "basis" "SubscriptionBasis" NOT NULL,
    "program_id" TEXT,
    "event_id" TEXT,
    "duration_months" INTEGER NOT NULL DEFAULT 12,
    "fee" DECIMAL(12,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_enrollments" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "member_id" TEXT,
    "payer_name" TEXT NOT NULL,
    "payer_mobile" TEXT NOT NULL,
    "payer_email" TEXT,
    "program_id" TEXT,
    "event_id" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "SubscriptionEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "status" "EmailLogStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "payload_json" JSONB,
    "membership_application_id" TEXT,
    "renewal_application_id" TEXT,
    "member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "payload_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_vouchers" (
    "id" TEXT NOT NULL,
    "voucher_number" TEXT NOT NULL,
    "expense_category" "ExpenseCategory" NOT NULL,
    "status" "ExpenseVoucherStatus" NOT NULL DEFAULT 'SUBMITTED',
    "expense_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "paid_to" TEXT NOT NULL,
    "transaction_ref" TEXT,
    "supporting_bill_no" TEXT,
    "supporting_bill_file_id" TEXT,
    "program_id" TEXT,
    "entered_by_user_id" TEXT,
    "approved_by_user_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cognito_sub_key" ON "users"("cognito_sub");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "genders_code_key" ON "genders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "nationalities_code_key" ON "nationalities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "states_code_key" ON "states"("code");

-- CreateIndex
CREATE UNIQUE INDEX "districts_state_id_name_key" ON "districts"("state_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "mandals_district_id_name_key" ON "mandals"("district_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "yoga_qualification_levels_code_key" ON "yoga_qualification_levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "yoga_professional_types_code_key" ON "yoga_professional_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employment_statuses_code_key" ON "employment_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gov_work_interest_options_code_key" ON "gov_work_interest_options"("code");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_responses_code_key" ON "volunteer_responses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lecture_languages_code_key" ON "lecture_languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employment_preference_types_code_key" ON "employment_preference_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "professional_challenge_types_code_key" ON "professional_challenge_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "educator_surveys_reference_number_key" ON "educator_surveys"("reference_number");

-- CreateIndex
CREATE INDEX "educator_surveys_email_idx" ON "educator_surveys"("email");

-- CreateIndex
CREATE INDEX "educator_surveys_submission_status_review_status_idx" ON "educator_surveys"("submission_status", "review_status");

-- CreateIndex
CREATE INDEX "educator_survey_yoga_qualifications_educator_survey_id_idx" ON "educator_survey_yoga_qualifications"("educator_survey_id");

-- CreateIndex
CREATE UNIQUE INDEX "stored_files_storage_key_key" ON "stored_files"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_application_reference_key" ON "membership_applications"("application_reference");

-- CreateIndex
CREATE INDEX "membership_applications_email_idx" ON "membership_applications"("email");

-- CreateIndex
CREATE INDEX "membership_applications_application_status_payment_status_idx" ON "membership_applications"("application_status", "payment_status");

-- CreateIndex
CREATE INDEX "membership_application_yoga_qualifications_membership_appli_idx" ON "membership_application_yoga_qualifications"("membership_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_membership_number_key" ON "members"("membership_number");

-- CreateIndex
CREATE UNIQUE INDEX "members_membership_application_id_key" ON "members"("membership_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_user_id_key" ON "members"("user_id");

-- CreateIndex
CREATE INDEX "members_email_idx" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "renewal_applications_renewal_reference_key" ON "renewal_applications"("renewal_reference");

-- CreateIndex
CREATE INDEX "renewal_applications_member_id_renewal_status_idx" ON "renewal_applications"("member_id", "renewal_status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_receipt_number_key" ON "payment_records"("receipt_number");

-- CreateIndex
CREATE INDEX "payment_records_payment_reference_idx" ON "payment_records"("payment_reference");

-- CreateIndex
CREATE INDEX "payment_records_payment_category_payment_date_idx" ON "payment_records"("payment_category", "payment_date");

-- CreateIndex
CREATE INDEX "payment_records_verification_status_payment_date_idx" ON "payment_records"("verification_status", "payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "events_code_key" ON "events"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "subscription_enrollments_member_id_status_idx" ON "subscription_enrollments"("member_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_vouchers_voucher_number_key" ON "expense_vouchers"("voucher_number");

-- CreateIndex
CREATE INDEX "expense_vouchers_expense_category_expense_date_idx" ON "expense_vouchers"("expense_category", "expense_date");

-- CreateIndex
CREATE INDEX "expense_vouchers_status_expense_date_idx" ON "expense_vouchers"("status", "expense_date");

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandals" ADD CONSTRAINT "mandals_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "genders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "nationalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_mandal_id_fkey" FOREIGN KEY ("mandal_id") REFERENCES "mandals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_highest_yoga_qualification_level_id_fkey" FOREIGN KEY ("highest_yoga_qualification_level_id") REFERENCES "yoga_qualification_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_yoga_professional_type_id_fkey" FOREIGN KEY ("yoga_professional_type_id") REFERENCES "yoga_professional_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_employment_status_id_fkey" FOREIGN KEY ("employment_status_id") REFERENCES "employment_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_gov_work_interest_id_fkey" FOREIGN KEY ("gov_work_interest_id") REFERENCES "gov_work_interest_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_surveys" ADD CONSTRAINT "educator_surveys_volunteer_response_id_fkey" FOREIGN KEY ("volunteer_response_id") REFERENCES "volunteer_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_yoga_qualifications" ADD CONSTRAINT "educator_survey_yoga_qualifications_educator_survey_id_fkey" FOREIGN KEY ("educator_survey_id") REFERENCES "educator_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_yoga_qualifications" ADD CONSTRAINT "educator_survey_yoga_qualifications_yoga_qualification_lev_fkey" FOREIGN KEY ("yoga_qualification_level_id") REFERENCES "yoga_qualification_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_languages" ADD CONSTRAINT "educator_survey_languages_educator_survey_id_fkey" FOREIGN KEY ("educator_survey_id") REFERENCES "educator_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_languages" ADD CONSTRAINT "educator_survey_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "lecture_languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_employment_preferences" ADD CONSTRAINT "educator_survey_employment_preferences_educator_survey_id_fkey" FOREIGN KEY ("educator_survey_id") REFERENCES "educator_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_employment_preferences" ADD CONSTRAINT "educator_survey_employment_preferences_preference_type_id_fkey" FOREIGN KEY ("preference_type_id") REFERENCES "employment_preference_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_challenges" ADD CONSTRAINT "educator_survey_challenges_educator_survey_id_fkey" FOREIGN KEY ("educator_survey_id") REFERENCES "educator_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educator_survey_challenges" ADD CONSTRAINT "educator_survey_challenges_challenge_type_id_fkey" FOREIGN KEY ("challenge_type_id") REFERENCES "professional_challenge_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_educator_survey_id_fkey" FOREIGN KEY ("educator_survey_id") REFERENCES "educator_surveys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_mandal_id_fkey" FOREIGN KEY ("mandal_id") REFERENCES "mandals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_highest_yoga_qualification_level_i_fkey" FOREIGN KEY ("highest_yoga_qualification_level_id") REFERENCES "yoga_qualification_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_photo_file_id_fkey" FOREIGN KEY ("photo_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_identity_proof_file_id_fkey" FOREIGN KEY ("identity_proof_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_application_yoga_qualifications" ADD CONSTRAINT "membership_application_yoga_qualifications_membership_appl_fkey" FOREIGN KEY ("membership_application_id") REFERENCES "membership_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_application_yoga_qualifications" ADD CONSTRAINT "membership_application_yoga_qualifications_yoga_qualificat_fkey" FOREIGN KEY ("yoga_qualification_level_id") REFERENCES "yoga_qualification_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_membership_application_id_fkey" FOREIGN KEY ("membership_application_id") REFERENCES "membership_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_photo_file_id_fkey" FOREIGN KEY ("photo_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_identity_proof_file_id_fkey" FOREIGN KEY ("identity_proof_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_membership_card_file_id_fkey" FOREIGN KEY ("membership_card_file_id") REFERENCES "stored_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_applications" ADD CONSTRAINT "renewal_applications_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_membership_application_id_fkey" FOREIGN KEY ("membership_application_id") REFERENCES "membership_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_renewal_application_id_fkey" FOREIGN KEY ("renewal_application_id") REFERENCES "renewal_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_subscription_enrollment_id_fkey" FOREIGN KEY ("subscription_enrollment_id") REFERENCES "subscription_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_enrollments" ADD CONSTRAINT "subscription_enrollments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_enrollments" ADD CONSTRAINT "subscription_enrollments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_enrollments" ADD CONSTRAINT "subscription_enrollments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_enrollments" ADD CONSTRAINT "subscription_enrollments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_vouchers" ADD CONSTRAINT "expense_vouchers_supporting_bill_file_id_fkey" FOREIGN KEY ("supporting_bill_file_id") REFERENCES "stored_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_vouchers" ADD CONSTRAINT "expense_vouchers_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_vouchers" ADD CONSTRAINT "expense_vouchers_entered_by_user_id_fkey" FOREIGN KEY ("entered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_vouchers" ADD CONSTRAINT "expense_vouchers_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
