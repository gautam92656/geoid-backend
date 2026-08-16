-- AlterTable: allow negative depth on well backfill type catalogs
ALTER TABLE "well_backfill_type_templates"
  ADD COLUMN IF NOT EXISTS "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "user_well_backfill_types"
  ADD COLUMN IF NOT EXISTS "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "log_well_backfills" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "depth_from" VARCHAR(50) NOT NULL DEFAULT '',
    "depth_to" VARCHAR(50) NOT NULL DEFAULT '',
    "backfill_type_id" VARCHAR(100) NOT NULL,
    "backfill_type_name" VARCHAR(200) NOT NULL,
    "comments" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_well_backfills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_well_backfills_log_id_deleted_at_sort_order_idx"
  ON "log_well_backfills"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_well_backfills_project_id_log_id_idx"
  ON "log_well_backfills"("project_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_well_backfills"
    ADD CONSTRAINT "log_well_backfills_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_well_backfills"
    ADD CONSTRAINT "log_well_backfills_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_well_backfills"
    ADD CONSTRAINT "log_well_backfills_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
