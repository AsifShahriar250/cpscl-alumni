-- CreateTable
CREATE TABLE "batches" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "batches_name_key" ON "batches"("name");

-- CreateIndex
CREATE INDEX "batches_name_idx" ON "batches"("name");

-- CreateIndex
CREATE INDEX "batches_start_year_idx" ON "batches"("start_year");

-- CreateIndex
CREATE INDEX "batches_end_year_idx" ON "batches"("end_year");

-- CreateIndex
CREATE INDEX "batches_is_active_idx" ON "batches"("is_active");
