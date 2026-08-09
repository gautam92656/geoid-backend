-- Persist per-module configuration for enabled log-configuration modules
ALTER TABLE "log_configurations"
ADD COLUMN "module_settings" JSONB NOT NULL DEFAULT '{}'::jsonb;
