-- CreateTable
CREATE TABLE "log_subsurface_layers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_id" INTEGER NOT NULL,
    "depth" VARCHAR(50) NOT NULL,
    "classification" VARCHAR(100) NOT NULL DEFAULT '',
    "origin" VARCHAR(100) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "consistency" VARCHAR(100) NOT NULL DEFAULT '',
    "moisture" VARCHAR(100) NOT NULL DEFAULT '',
    "remarks" TEXT NOT NULL DEFAULT '',
    "hatch" VARCHAR(50) NOT NULL DEFAULT 'empty',
    "values" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_subsurface_layers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_subsurface_layers_log_id_deleted_at_sort_order_idx" ON "log_subsurface_layers"("log_id", "deleted_at", "sort_order");

-- CreateIndex
CREATE INDEX "log_subsurface_layers_project_id_log_id_idx" ON "log_subsurface_layers"("project_id", "log_id");

-- AddForeignKey
ALTER TABLE "log_subsurface_layers" ADD CONSTRAINT "log_subsurface_layers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_subsurface_layers" ADD CONSTRAINT "log_subsurface_layers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_subsurface_layers" ADD CONSTRAINT "log_subsurface_layers_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
