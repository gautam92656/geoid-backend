-- CreateTable
CREATE TABLE IF NOT EXISTS "log_insitu_tests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
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

    CONSTRAINT "log_insitu_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_insitu_tests_log_id_deleted_at_sort_order_idx"
  ON "log_insitu_tests"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_insitu_tests_project_id_log_id_idx"
  ON "log_insitu_tests"("project_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_insitu_tests"
    ADD CONSTRAINT "log_insitu_tests_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_insitu_tests"
    ADD CONSTRAINT "log_insitu_tests_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_insitu_tests"
    ADD CONSTRAINT "log_insitu_tests_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
