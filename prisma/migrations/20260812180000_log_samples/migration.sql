-- CreateTable
CREATE TABLE IF NOT EXISTS "log_samples" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "depth_from" VARCHAR(50) NOT NULL,
    "depth_to" VARCHAR(50) NOT NULL DEFAULT '',
    "sample_type_id" VARCHAR(100) NOT NULL,
    "sample_type_name" VARCHAR(200) NOT NULL,
    "sample_no" VARCHAR(200) NOT NULL DEFAULT '',
    "qc_sample_id" VARCHAR(200) NOT NULL DEFAULT '',
    "sample_date" VARCHAR(50) NOT NULL DEFAULT '',
    "sample_time" VARCHAR(50) NOT NULL DEFAULT '',
    "recovery" VARCHAR(100) NOT NULL DEFAULT '',
    "comments" TEXT NOT NULL DEFAULT '',
    "insitu_tests" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_samples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_samples_log_id_deleted_at_sort_order_idx"
  ON "log_samples"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_samples_project_id_log_id_idx"
  ON "log_samples"("project_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_samples"
    ADD CONSTRAINT "log_samples_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_samples"
    ADD CONSTRAINT "log_samples_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_samples"
    ADD CONSTRAINT "log_samples_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
