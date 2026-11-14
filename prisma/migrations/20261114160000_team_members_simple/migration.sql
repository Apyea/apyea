-- Simplify team_members: name, designation, qualification, photo, display order only

ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "qualification" TEXT;

UPDATE "team_members"
SET "qualification" = COALESCE(
  NULLIF(
    TRIM(
      CONCAT_WS(
        E'\n',
        NULLIF(TRIM("educational_qualification"), ''),
        NULLIF(TRIM("yoga_qualification"), '')
      )
    ),
    ''
  ),
  NULLIF(TRIM("educational_qualification"), ''),
  NULLIF(TRIM("yoga_qualification"), '')
)
WHERE "qualification" IS NULL;

ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_district_id_fkey";

DROP INDEX IF EXISTS "team_members_committee_is_published_is_active_display_order_idx";
DROP INDEX IF EXISTS "team_members_is_published_is_active_idx";
DROP INDEX IF EXISTS "team_members_slug_key";

ALTER TABLE "team_members" DROP COLUMN IF EXISTS "slug";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "committee";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "district_id";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "yoga_qualification";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "educational_qualification";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "professional_experience";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "biography";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "email";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "mobile";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "appointment_start";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "appointment_end";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "is_active";
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "is_published";

DROP TYPE IF EXISTS "TeamMemberCommittee";

CREATE INDEX IF NOT EXISTS "team_members_display_order_full_name_idx" ON "team_members"("display_order", "full_name");