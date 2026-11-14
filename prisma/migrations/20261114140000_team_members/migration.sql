-- CreateEnum
CREATE TYPE "TeamMemberCommittee" AS ENUM (
  'OFFICE_BEARERS',
  'EXECUTIVE_COMMITTEE',
  'ADVISORY_COMMITTEE',
  'DISTRICT_COORDINATORS',
  'UNIT_COORDINATORS',
  'OTHER_TEAM'
);

CREATE TYPE "TeamMemberDesignation" AS ENUM (
  'PRESIDENT',
  'VICE_PRESIDENT',
  'SECRETARY',
  'TREASURER',
  'EXECUTIVE_MEMBER',
  'ADVISORY_MEMBER',
  'DISTRICT_COORDINATOR',
  'UNIT_COORDINATOR',
  'MEMBER'
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "committee" "TeamMemberCommittee" NOT NULL,
    "designation" "TeamMemberDesignation" NOT NULL,
    "district_id" TEXT,
    "photo_file_id" TEXT,
    "yoga_qualification" TEXT,
    "educational_qualification" TEXT,
    "professional_experience" TEXT,
    "biography" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "appointment_start" DATE NOT NULL,
    "appointment_end" DATE,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "team_members_slug_key" ON "team_members"("slug");
CREATE INDEX "team_members_committee_is_published_is_active_display_order_idx" ON "team_members"("committee", "is_published", "is_active", "display_order");
CREATE INDEX "team_members_is_published_is_active_idx" ON "team_members"("is_published", "is_active");

ALTER TABLE "team_members" ADD CONSTRAINT "team_members_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_file_id_fkey" FOREIGN KEY ("photo_file_id") REFERENCES "stored_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;