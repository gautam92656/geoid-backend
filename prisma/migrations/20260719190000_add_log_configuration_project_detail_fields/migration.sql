-- AlterTable
ALTER TABLE "log_configurations" ADD COLUMN "project_detail_fields" JSONB NOT NULL DEFAULT '{}';
