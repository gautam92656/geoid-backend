-- CreateEnum
CREATE TYPE "log_report_template_log_type" AS ENUM ('borelog', 'corelog');

-- CreateTable
CREATE TABLE "log_report_templates" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "log_type" "log_report_template_log_type" NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "log_configuration_ids" JSONB NOT NULL DEFAULT '[]',
    "template_version" INTEGER NOT NULL DEFAULT 2,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_report_templates_user_id_deleted_at_idx" ON "log_report_templates"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "log_report_templates_user_id_log_type_deleted_at_idx" ON "log_report_templates"("user_id", "log_type", "deleted_at");

-- AddForeignKey
ALTER TABLE "log_report_templates" ADD CONSTRAINT "log_report_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
