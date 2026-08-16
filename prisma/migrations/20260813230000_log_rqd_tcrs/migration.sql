-- CreateTable
CREATE TABLE IF NOT EXISTS "log_rqd_tcrs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "depth_from" VARCHAR(50) NOT NULL DEFAULT '',
    "depth_to" VARCHAR(50) NOT NULL DEFAULT '',
    "start_date" VARCHAR(50) NOT NULL DEFAULT '',
    "start_time" VARCHAR(50) NOT NULL DEFAULT '',
    "end_date" VARCHAR(50) NOT NULL DEFAULT '',
    "end_time" VARCHAR(50) NOT NULL DEFAULT '',
    "core_piece_length" VARCHAR(50) NOT NULL DEFAULT '',
    "rqd_percent" VARCHAR(50) NOT NULL,
    "core_loss_length" VARCHAR(50) NOT NULL,
    "core_recovery_length" VARCHAR(50) NOT NULL,
    "tcr_percent" VARCHAR(50) NOT NULL,
    "photo_name" VARCHAR(255) NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_rqd_tcrs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_rqd_tcrs_log_id_deleted_at_sort_order_idx"
  ON "log_rqd_tcrs"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_rqd_tcrs_project_id_log_id_idx"
  ON "log_rqd_tcrs"("project_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_rqd_tcrs"
    ADD CONSTRAINT "log_rqd_tcrs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_rqd_tcrs"
    ADD CONSTRAINT "log_rqd_tcrs_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_rqd_tcrs"
    ADD CONSTRAINT "log_rqd_tcrs_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
