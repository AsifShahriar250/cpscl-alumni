-- CreateEnum
CREATE TYPE "MemoryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "memories" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memories_author_id_idx" ON "memories"("author_id");

-- CreateIndex
CREATE INDEX "memories_created_at_idx" ON "memories"("created_at");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
