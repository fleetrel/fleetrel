/*
  Warnings:

  - Made the column `refresh_token_hash` on table `auth_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "auth_sessions" ALTER COLUMN "refresh_token_hash" SET NOT NULL;
