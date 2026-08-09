-- Dedicated Insitu Tests modal collections (testing types + unit settings).

-- ---------------------------------------------------------------------------
-- Testing type templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "log_configuration_insitu_test_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "graphic" VARCHAR(255),
    "enable_segregated_graphic" BOOLEAN NOT NULL DEFAULT false,
    "top_graphic" VARCHAR(255),
    "bottom_graphic" VARCHAR(255),
    "depth_frequency_enabled" BOOLEAN NOT NULL DEFAULT false,
    "depth_frequency" VARCHAR(100),
    "enable_sample_logging" BOOLEAN NOT NULL DEFAULT false,
    "enable_subsurface_logging" BOOLEAN NOT NULL DEFAULT false,
    "default_sample_type_id" VARCHAR(100),
    "enable_auto_sample_description" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_insitu_test_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lc_insitu_type_tpl_module_key"
  ON "log_configuration_insitu_test_type_templates"("module_slug", "option_key");

CREATE INDEX "lc_insitu_type_tpl_module_sort_idx"
  ON "log_configuration_insitu_test_type_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Testing types (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "log_configuration_user_insitu_test_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "graphic" VARCHAR(255),
    "enable_segregated_graphic" BOOLEAN NOT NULL DEFAULT false,
    "top_graphic" VARCHAR(255),
    "bottom_graphic" VARCHAR(255),
    "depth_frequency_enabled" BOOLEAN NOT NULL DEFAULT false,
    "depth_frequency" VARCHAR(100),
    "enable_sample_logging" BOOLEAN NOT NULL DEFAULT false,
    "enable_subsurface_logging" BOOLEAN NOT NULL DEFAULT false,
    "default_sample_type_id" VARCHAR(100),
    "enable_auto_sample_description" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_user_insitu_test_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lc_user_insitu_types_config_key"
  ON "log_configuration_user_insitu_test_types"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "lc_user_insitu_types_user_config_idx"
  ON "log_configuration_user_insitu_test_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "log_configuration_user_insitu_test_types"
  ADD CONSTRAINT "log_configuration_user_insitu_test_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "log_configuration_user_insitu_test_types"
  ADD CONSTRAINT "log_configuration_user_insitu_test_types_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Unit setting templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "log_configuration_insitu_unit_setting_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_insitu_unit_setting_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lc_insitu_unit_tpl_module_key"
  ON "log_configuration_insitu_unit_setting_templates"("module_slug", "option_key");

CREATE INDEX "lc_insitu_unit_tpl_module_sort_idx"
  ON "log_configuration_insitu_unit_setting_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Unit settings (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "log_configuration_user_insitu_unit_settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_user_insitu_unit_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lc_user_insitu_units_config_key"
  ON "log_configuration_user_insitu_unit_settings"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "lc_user_insitu_units_user_config_idx"
  ON "log_configuration_user_insitu_unit_settings"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "log_configuration_user_insitu_unit_settings"
  ADD CONSTRAINT "log_configuration_user_insitu_unit_settings_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "log_configuration_user_insitu_unit_settings"
  ADD CONSTRAINT "log_configuration_user_insitu_unit_settings_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
