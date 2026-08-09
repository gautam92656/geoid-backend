-- Water Observations dedicated collection (observation types).

CREATE TABLE "water_observation_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "depth_required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "water_observation_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "water_obs_type_tpl_module_key"
  ON "water_observation_type_templates"("module_slug", "option_key");

CREATE INDEX "water_obs_type_tpl_module_sort_idx"
  ON "water_observation_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_water_observation_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "depth_required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_water_observation_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_water_obs_type_config_key"
  ON "user_water_observation_types"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_water_obs_type_user_config_idx"
  ON "user_water_observation_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_water_observation_types"
  ADD CONSTRAINT "user_water_observation_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_water_observation_types"
  ADD CONSTRAINT "user_water_observation_types_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
