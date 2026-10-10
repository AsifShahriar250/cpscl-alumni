-- AlterTable
ALTER TABLE "alumni_profiles" ADD COLUMN     "batch_id" UUID;

-- CreateIndex
CREATE INDEX "alumni_profiles_batch_id_idx" ON "alumni_profiles"("batch_id");

-- AddForeignKey
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
