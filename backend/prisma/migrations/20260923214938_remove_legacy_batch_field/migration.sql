/*
  Warnings:

  - You are about to drop the column `batch` on the `alumni_profiles` table. All the data in the column will be lost.
  - Made the column `batch_id` on table `alumni_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "alumni_profiles_batch_idx";

-- AlterTable
ALTER TABLE "alumni_profiles" DROP COLUMN "batch",
ALTER COLUMN "batch_id" SET NOT NULL;
