-- CreateTable
CREATE TABLE "alumni_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "date_of_birth" TIMESTAMP(3),
    "gender" VARCHAR(30),
    "bio" TEXT,
    "batch" VARCHAR(100) NOT NULL,
    "graduation_year" INTEGER NOT NULL,
    "university" VARCHAR(200) NOT NULL,
    "department" VARCHAR(200) NOT NULL,
    "profession" VARCHAR(150),
    "organization" VARCHAR(200),
    "designation" VARCHAR(150),
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "profile_photo_url" VARCHAR(500),
    "linkedin_url" VARCHAR(500),
    "facebook_url" VARCHAR(500),
    "github_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "is_directory_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alumni_profiles_user_id_key" ON "alumni_profiles"("user_id");

-- CreateIndex
CREATE INDEX "alumni_profiles_full_name_idx" ON "alumni_profiles"("full_name");

-- CreateIndex
CREATE INDEX "alumni_profiles_batch_idx" ON "alumni_profiles"("batch");

-- CreateIndex
CREATE INDEX "alumni_profiles_graduation_year_idx" ON "alumni_profiles"("graduation_year");

-- CreateIndex
CREATE INDEX "alumni_profiles_university_idx" ON "alumni_profiles"("university");

-- CreateIndex
CREATE INDEX "alumni_profiles_department_idx" ON "alumni_profiles"("department");

-- CreateIndex
CREATE INDEX "alumni_profiles_profession_idx" ON "alumni_profiles"("profession");

-- CreateIndex
CREATE INDEX "alumni_profiles_organization_idx" ON "alumni_profiles"("organization");

-- CreateIndex
CREATE INDEX "alumni_profiles_city_idx" ON "alumni_profiles"("city");

-- CreateIndex
CREATE INDEX "alumni_profiles_country_idx" ON "alumni_profiles"("country");

-- AddForeignKey
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
