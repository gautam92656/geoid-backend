-- AlterTable: allow negative depth on well probe type catalogs
ALTER TABLE "well_probe_type_templates"
  ADD COLUMN IF NOT EXISTS "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "user_well_probe_types"
  ADD COLUMN IF NOT EXISTS "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "log_well_probes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "well_id" VARCHAR(100) NOT NULL DEFAULT '',
    "well_id_label" VARCHAR(200) NOT NULL DEFAULT '',
    "probe_type_id" VARCHAR(100) NOT NULL,
    "probe_type_name" VARCHAR(200) NOT NULL,
    "depth_from" VARCHAR(50) NOT NULL DEFAULT '',
    "depth_to" VARCHAR(50) NOT NULL DEFAULT '',
    "comments" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_well_probes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_well_probes_log_id_deleted_at_sort_order_idx"
  ON "log_well_probes"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_well_probes_project_id_log_id_idx"
  ON "log_well_probes"("project_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_well_probes"
    ADD CONSTRAINT "log_well_probes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_well_probes"
    ADD CONSTRAINT "log_well_probes_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_well_probes"
    ADD CONSTRAINT "log_well_probes_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
