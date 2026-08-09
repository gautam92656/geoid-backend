-- Dedicated Core Logging modal collections (defect types, aperture colors/minerals, infill materials).

-- ---------------------------------------------------------------------------
-- Core defect type templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "core_defect_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "graphic" VARCHAR(255),
    "default_sample_type_id" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "core_defect_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "core_defect_tpl_module_key"
  ON "core_defect_type_templates"("module_slug", "option_key");

CREATE INDEX "core_defect_tpl_module_sort_idx"
  ON "core_defect_type_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Core defect types (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_core_defect_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "graphic" VARCHAR(255),
    "default_sample_type_id" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_core_defect_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_core_defect_config_key"
  ON "user_core_defect_types"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_core_defect_user_config_idx"
  ON "user_core_defect_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_core_defect_types"
  ADD CONSTRAINT "user_core_defect_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_core_defect_types"
  ADD CONSTRAINT "user_core_defect_types_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Aperture color templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "aperture_color_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "color" VARCHAR(50),
    "text_color" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aperture_color_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aperture_color_tpl_module_key"
  ON "aperture_color_templates"("module_slug", "option_key");

CREATE INDEX "aperture_color_tpl_module_sort_idx"
  ON "aperture_color_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Aperture colors (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_aperture_colors" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "color" VARCHAR(50),
    "text_color" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_aperture_colors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_aperture_color_config_key"
  ON "user_aperture_colors"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_aperture_color_user_config_idx"
  ON "user_aperture_colors"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_aperture_colors"
  ADD CONSTRAINT "user_aperture_colors_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_aperture_colors"
  ADD CONSTRAINT "user_aperture_colors_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Aperture mineral templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "aperture_mineral_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aperture_mineral_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aperture_mineral_tpl_module_key"
  ON "aperture_mineral_templates"("module_slug", "option_key");

CREATE INDEX "aperture_mineral_tpl_module_sort_idx"
  ON "aperture_mineral_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Aperture minerals (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_aperture_minerals" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_aperture_minerals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_aperture_mineral_config_key"
  ON "user_aperture_minerals"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_aperture_mineral_user_config_idx"
  ON "user_aperture_minerals"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_aperture_minerals"
  ADD CONSTRAINT "user_aperture_minerals_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_aperture_minerals"
  ADD CONSTRAINT "user_aperture_minerals_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Infill material templates (common)
-- ---------------------------------------------------------------------------
CREATE TABLE "infill_material_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "infill_material_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "infill_material_tpl_module_key"
  ON "infill_material_templates"("module_slug", "option_key");

CREATE INDEX "infill_material_tpl_module_sort_idx"
  ON "infill_material_templates"("module_slug", "sort_order");

-- ---------------------------------------------------------------------------
-- Infill materials (per log configuration)
-- ---------------------------------------------------------------------------
CREATE TABLE "user_infill_materials" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_infill_materials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_infill_material_config_key"
  ON "user_infill_materials"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_infill_material_user_config_idx"
  ON "user_infill_materials"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_infill_materials"
  ADD CONSTRAINT "user_infill_materials_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_infill_materials"
  ADD CONSTRAINT "user_infill_materials_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
