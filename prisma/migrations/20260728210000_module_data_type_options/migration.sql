-- Common data-type option catalog (rock_type, non_soil_type, …)
CREATE TABLE IF NOT EXISTS "log_configuration_data_type_option_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "data_type_id" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "graphic" VARCHAR(255),
    "rock_group" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_data_type_option_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "log_configuration_data_type_option_templates_module_slug_da_key"
  ON "log_configuration_data_type_option_templates"("module_slug", "data_type_id", "option_key");

CREATE INDEX IF NOT EXISTS "log_configuration_data_type_option_templates_module_slug_da_idx"
  ON "log_configuration_data_type_option_templates"("module_slug", "data_type_id", "sort_order");

-- Per-user customized data-type options
CREATE TABLE IF NOT EXISTS "log_configuration_user_data_type_options" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "data_type_id" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "graphic" VARCHAR(255),
    "rock_group" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_user_data_type_options_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "log_configuration_user_data_type_options_user_id_module_slu_key"
  ON "log_configuration_user_data_type_options"("user_id", "module_slug", "data_type_id", "option_key");

CREATE INDEX IF NOT EXISTS "log_configuration_user_data_type_options_user_id_module_slu_idx"
  ON "log_configuration_user_data_type_options"("user_id", "module_slug", "data_type_id", "sort_order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'log_configuration_user_data_type_options_user_id_fkey'
  ) THEN
    ALTER TABLE "log_configuration_user_data_type_options"
      ADD CONSTRAINT "log_configuration_user_data_type_options_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
