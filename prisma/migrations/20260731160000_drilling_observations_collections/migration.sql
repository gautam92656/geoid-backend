-- Drilling Observations dedicated collections (types, resistances, observations, casings).

-- ---------------------------------------------------------------------------
-- Drilling type templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "drilling_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "log_kind" VARCHAR(20) NOT NULL DEFAULT 'bore',
    "graphic" VARCHAR(255),
    "enable_recovery_field" BOOLEAN NOT NULL DEFAULT false,
    "enable_windowed_windowless" BOOLEAN NOT NULL DEFAULT false,
    "water_added" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drilling_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "drilling_type_tpl_module_key"
  ON "drilling_type_templates"("module_slug", "option_key");

CREATE INDEX "drilling_type_tpl_module_sort_idx"
  ON "drilling_type_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Drilling types (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_drilling_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "log_kind" VARCHAR(20) NOT NULL DEFAULT 'bore',
    "graphic" VARCHAR(255),
    "enable_recovery_field" BOOLEAN NOT NULL DEFAULT false,
    "enable_windowed_windowless" BOOLEAN NOT NULL DEFAULT false,
    "water_added" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_drilling_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_drilling_type_config_key"
  ON "user_drilling_types"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_drilling_type_user_config_idx"
  ON "user_drilling_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_drilling_types"
  ADD CONSTRAINT "user_drilling_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_drilling_types"
  ADD CONSTRAINT "user_drilling_types_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Drilling resistance templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "drilling_resistance_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drilling_resistance_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "drilling_resist_tpl_module_key"
  ON "drilling_resistance_templates"("module_slug", "option_key");

CREATE INDEX "drilling_resist_tpl_module_sort_idx"
  ON "drilling_resistance_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Drilling resistances (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_drilling_resistances" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_drilling_resistances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_drilling_resist_config_key"
  ON "user_drilling_resistances"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_drilling_resist_user_config_idx"
  ON "user_drilling_resistances"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_drilling_resistances"
  ADD CONSTRAINT "user_drilling_resistances_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_drilling_resistances"
  ADD CONSTRAINT "user_drilling_resistances_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Drilling observation templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "drilling_observation_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "depth_required" BOOLEAN NOT NULL DEFAULT false,
    "observation_date_time_required" BOOLEAN NOT NULL DEFAULT false,
    "is_depth_of_casing" BOOLEAN NOT NULL DEFAULT false,
    "is_depth_to_water" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drilling_observation_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "drilling_obs_tpl_module_key"
  ON "drilling_observation_templates"("module_slug", "option_key");

CREATE INDEX "drilling_obs_tpl_module_sort_idx"
  ON "drilling_observation_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Drilling observations (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_drilling_observations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "depth_required" BOOLEAN NOT NULL DEFAULT false,
    "observation_date_time_required" BOOLEAN NOT NULL DEFAULT false,
    "is_depth_of_casing" BOOLEAN NOT NULL DEFAULT false,
    "is_depth_to_water" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_drilling_observations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_drilling_obs_config_key"
  ON "user_drilling_observations"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_drilling_obs_user_config_idx"
  ON "user_drilling_observations"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_drilling_observations"
  ADD CONSTRAINT "user_drilling_observations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_drilling_observations"
  ADD CONSTRAINT "user_drilling_observations_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Drilling casing templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "drilling_casing_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "start_graphic" VARCHAR(255),
    "end_graphic" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drilling_casing_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "drilling_casing_tpl_module_key"
  ON "drilling_casing_templates"("module_slug", "option_key");

CREATE INDEX "drilling_casing_tpl_module_sort_idx"
  ON "drilling_casing_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Drilling casings (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_drilling_casings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "start_graphic" VARCHAR(255),
    "end_graphic" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_drilling_casings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_drilling_casing_config_key"
  ON "user_drilling_casings"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_drilling_casing_user_config_idx"
  ON "user_drilling_casings"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_drilling_casings"
  ADD CONSTRAINT "user_drilling_casings_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_drilling_casings"
  ADD CONSTRAINT "user_drilling_casings_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
