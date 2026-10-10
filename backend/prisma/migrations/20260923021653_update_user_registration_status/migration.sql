/*
  Change UserStatus:
  ACTIVE -> EMAIL_UNVERIFIED

  Existing ACTIVE users are preserved and moved to
  EMAIL_UNVERIFIED before the old enum is removed.
*/

BEGIN;

CREATE TYPE "UserStatus_new" AS ENUM (
  'EMAIL_UNVERIFIED',
  'PENDING_VERIFICATION',
  'APPROVED',
  'REJECTED',
  'CORRECTION_REQUIRED',
  'SUSPENDED',
  'INACTIVE',
  'DELETED'
);

ALTER TABLE "public"."users"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "public"."users"
  ALTER COLUMN "status" TYPE "UserStatus_new"
  USING (
    CASE
      WHEN "status"::text = 'ACTIVE' THEN 'EMAIL_UNVERIFIED'
      ELSE "status"::text
    END
  )::"UserStatus_new";

ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";

ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";

DROP TYPE "public"."UserStatus_old";

ALTER TABLE "public"."users"
  ALTER COLUMN "status" SET DEFAULT 'EMAIL_UNVERIFIED';

COMMIT;
