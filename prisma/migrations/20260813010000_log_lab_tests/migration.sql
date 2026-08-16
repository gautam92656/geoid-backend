-- CreateTable
CREATE TABLE IF NOT EXISTS "log_lab_tests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "sample_id" INTEGER,
    "sample_no" VARCHAR(200) NOT NULL DEFAULT '',
    "depth_from" VARCHAR(50) NOT NULL,
    "depth_to" VARCHAR(50) NOT NULL DEFAULT '',
    "test_type_id" VARCHAR(100) NOT NULL,
    "test_type_name" VARCHAR(200) NOT NULL,
    "results" TEXT NOT NULL DEFAULT '',
    "comments" TEXT NOT NULL DEFAULT '',
    "result_values" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_lab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_lab_tests_log_id_deleted_at_sort_order_idx"
  ON "log_lab_tests"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_lab_tests_project_id_log_id_idx"
  ON "log_lab_tests"("project_id", "log_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_lab_tests_sample_id_deleted_at_idx"
  ON "log_lab_tests"("sample_id", "deleted_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_lab_tests_log_id_test_type_id_deleted_at_idx"
  ON "log_lab_tests"("log_id", "test_type_id", "deleted_at");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_lab_tests"
    ADD CONSTRAINT "log_lab_tests_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_lab_tests"
    ADD CONSTRAINT "log_lab_tests_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_lab_tests"
    ADD CONSTRAINT "log_lab_tests_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_lab_tests"
    ADD CONSTRAINT "log_lab_tests_sample_id_fkey"
    FOREIGN KEY ("sample_id") REFERENCES "log_samples"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
