ALTER TABLE "log_configurations" ADD COLUMN "enabled_modules" JSONB NOT NULL DEFAULT '[]';
