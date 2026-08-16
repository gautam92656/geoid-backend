-- CreateTable
CREATE TABLE IF NOT EXISTS "log_core_defects" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "defect_type_id" VARCHAR(100) NOT NULL,
    "defect_type_name" VARCHAR(200) NOT NULL,
    "depth_from" VARCHAR(50) NOT NULL,
    "depth_to" VARCHAR(50) NOT NULL DEFAULT '',
    "defect_orientation" VARCHAR(50) NOT NULL DEFAULT '',
    "surface_shape_ids" JSONB NOT NULL DEFAULT '[]',
    "surface_roughness_ids" JSONB NOT NULL DEFAULT '[]',
    "defect_coating_ids" JSONB NOT NULL DEFAULT '[]',
    "defect_openness_ids" JSONB NOT NULL DEFAULT '[]',
    "defect_spacing_override" VARCHAR(50) NOT NULL DEFAULT '',
    "bounds_on_defect_min" VARCHAR(50) NOT NULL DEFAULT '',
    "bounds_on_defect_max" VARCHAR(50) NOT NULL DEFAULT '',
    "comments" TEXT NOT NULL DEFAULT '',
    "photo_name" VARCHAR(255) NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_core_defects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_core_defects_log_id_deleted_at_sort_order_idx"
  ON "log_core_defects"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_core_defects_project_id_log_id_idx"
  ON "log_core_defects"("project_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_core_defects"
    ADD CONSTRAINT "log_core_defects_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_core_defects"
    ADD CONSTRAINT "log_core_defects_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_core_defects"
    ADD CONSTRAINT "log_core_defects_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
