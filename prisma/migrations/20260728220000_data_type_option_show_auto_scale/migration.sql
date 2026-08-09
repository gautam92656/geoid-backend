-- Add show_auto_scale for finishing-reason (and future) options
ALTER TABLE "log_configuration_data_type_option_templates"
  ADD COLUMN IF NOT EXISTS "show_auto_scale" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "log_configuration_user_data_type_options"
  ADD COLUMN IF NOT EXISTS "show_auto_scale" BOOLEAN NOT NULL DEFAULT true;
