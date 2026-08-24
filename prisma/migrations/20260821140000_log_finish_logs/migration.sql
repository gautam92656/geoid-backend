-- AlterTable
ALTER TABLE "logs"
  ADD COLUMN IF NOT EXISTS "scale_log_report" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "log_finish_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "finish_type_id" VARCHAR(100) NOT NULL,
    "finish_type_name" VARCHAR(200) NOT NULL,
    "completed_date" DATE,
    "end_depth" VARCHAR(50) NOT NULL DEFAULT '',
    "comments" TEXT NOT NULL DEFAULT '',
    "scale_log_report" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_finish_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_finish_logs_log_id_deleted_at_sort_order_idx"
  ON "log_finish_logs"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_finish_logs_project_id_log_id_idx"
  ON "log_finish_logs"("project_id", "log_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_finish_logs_user_id_log_id_idx"
  ON "log_finish_logs"("user_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_finish_logs"
    ADD CONSTRAINT "log_finish_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_finish_logs"
    ADD CONSTRAINT "log_finish_logs_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_finish_logs"
    ADD CONSTRAINT "log_finish_logs_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
