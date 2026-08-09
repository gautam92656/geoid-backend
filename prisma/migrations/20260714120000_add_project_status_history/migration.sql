-- CreateTable
CREATE TABLE "project_status_history" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "project_status" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_status_history_project_id_created_at_idx" ON "project_status_history"("project_id", "created_at");

-- AddForeignKey
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill initial status history for existing projects
INSERT INTO "project_status_history" ("project_id", "user_id", "status", "created_at")
SELECT "id", "user_id", "status", "created_at"
FROM "projects";
