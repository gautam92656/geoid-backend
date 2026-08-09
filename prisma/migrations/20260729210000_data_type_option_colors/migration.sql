-- Color fields for geomodal_layer (and future) data-type options
ALTER TABLE "log_configuration_data_type_option_templates"
  ADD COLUMN IF NOT EXISTS "color" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "overlay_color" VARCHAR(100);

ALTER TABLE "log_configuration_user_data_type_options"
  ADD COLUMN IF NOT EXISTS "color" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "overlay_color" VARCHAR(100);
