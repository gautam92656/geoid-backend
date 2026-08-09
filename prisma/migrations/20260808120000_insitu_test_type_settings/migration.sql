-- AlterTable
ALTER TABLE "insitu_test_type_templates" ADD COLUMN IF NOT EXISTS "settings" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "user_insitu_test_types" ADD COLUMN IF NOT EXISTS "settings" JSONB NOT NULL DEFAULT '{}';
