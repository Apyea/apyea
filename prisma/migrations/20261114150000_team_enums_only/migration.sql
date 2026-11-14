-- For databases that already applied the earlier team_committees / team_designations migration.

ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_committee_id_fkey";
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_designation_id_fkey";

DROP TABLE IF EXISTS "team_designations";
DROP TABLE IF EXISTS "team_committees";

DROP INDEX IF EXISTS "team_members_committee_id_is_published_is_active_display_order_idx";

DO $$ BEGIN
  CREATE TYPE "TeamMemberCommittee" AS ENUM (
    'OFFICE_BEARERS',
    'EXECUTIVE_COMMITTEE',
    'ADVISORY_COMMITTEE',
    'DISTRICT_COORDINATORS',
    'UNIT_COORDINATORS',
    'OTHER_TEAM'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "team_members" DROP COLUMN IF EXISTS "committee_id";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "designation_id";

ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "committee" "TeamMemberCommittee";
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "designation" "TeamMemberDesignation";

UPDATE "team_members" SET "committee" = 'OTHER_TEAM' WHERE "committee" IS NULL;
UPDATE "team_members" SET "designation" = 'MEMBER' WHERE "designation" IS NULL;

ALTER TABLE "team_members" ALTER COLUMN "committee" SET NOT NULL;
ALTER TABLE "team_members" ALTER COLUMN "designation" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "team_members_committee_is_published_is_active_display_order_idx" ON "team_members"("committee", "is_published", "is_active", "display_order");