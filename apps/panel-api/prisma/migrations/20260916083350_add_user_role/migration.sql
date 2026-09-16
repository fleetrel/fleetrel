-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('owner', 'admin', 'operator', 'viewer');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'viewer';

-- Backfill: the earliest registered user becomes the panel owner, so existing
-- installations are not left without an owner once sign-up is closed.
UPDATE "users" SET "role" = 'owner'
WHERE "id" = (SELECT "id" FROM "users" ORDER BY "created_at" ASC, "id" ASC LIMIT 1);
