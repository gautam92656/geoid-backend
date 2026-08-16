-- CreateTable
CREATE TABLE IF NOT EXISTS "log_drilling_methods" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "depth_from" VARCHAR(50) NOT NULL DEFAULT '',
    "depth_to" VARCHAR(50) NOT NULL DEFAULT '',
    "drilling_method_id" VARCHAR(100) NOT NULL,
    "drilling_method_name" VARCHAR(200) NOT NULL,
    "windowed_windowless" VARCHAR(20) NOT NULL DEFAULT '',
    "diameter" VARCHAR(50) NOT NULL DEFAULT '',
    "recovery" VARCHAR(50) NOT NULL DEFAULT '',
    "water_added" VARCHAR(50) NOT NULL DEFAULT '',
    "comments" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_drilling_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_drilling_methods_log_id_deleted_at_sort_order_idx"
  ON "log_drilling_methods"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "log_drilling_methods_project_id_log_id_idx"
  ON "log_drilling_methods"("project_id", "log_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "log_drilling_methods"
    ADD CONSTRAINT "log_drilling_methods_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_drilling_methods"
    ADD CONSTRAINT "log_drilling_methods_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "log_drilling_methods"
    ADD CONSTRAINT "log_drilling_methods_log_id_fkey"
    FOREIGN KEY ("log_id") REFERENCES "logs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
