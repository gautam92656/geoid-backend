-- AlterTable
ALTER TABLE "log_configurations" ADD COLUMN "log_detail_fields" JSONB NOT NULL DEFAULT '{}';
