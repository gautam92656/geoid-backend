-- Colors catalog label text color (fill `color` already exists for geomodal_layer)
ALTER TABLE "log_configuration_data_type_option_templates"
  ADD COLUMN IF NOT EXISTS "text_color" VARCHAR(100);

ALTER TABLE "log_configuration_user_data_type_options"
  ADD COLUMN IF NOT EXISTS "text_color" VARCHAR(100);
