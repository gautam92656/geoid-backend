-- Lab Tests dedicated collections (lab test types + presets).

CREATE TABLE "lab_test_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "graphic" VARCHAR(255),
    "external_alias" VARCHAR(200),
    "alias_table" VARCHAR(200),
    "add_as_selected_data_plot" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lab_test_result_fields" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lab_test_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lab_test_type_tpl_module_key"
  ON "lab_test_type_templates"("module_slug", "option_key");

CREATE INDEX "lab_test_type_tpl_module_sort_idx"
  ON "lab_test_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_lab_test_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "graphic" VARCHAR(255),
    "external_alias" VARCHAR(200),
    "alias_table" VARCHAR(200),
    "add_as_selected_data_plot" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lab_test_result_fields" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_lab_test_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_lab_test_type_config_key"
  ON "user_lab_test_types"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_lab_test_type_user_config_idx"
  ON "user_lab_test_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_lab_test_types"
  ADD CONSTRAINT "user_lab_test_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_lab_test_types"
  ADD CONSTRAINT "user_lab_test_types_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "lab_test_preset_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "lab_test_type_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lab_test_preset_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lab_test_preset_tpl_module_key"
  ON "lab_test_preset_templates"("module_slug", "option_key");

CREATE INDEX "lab_test_preset_tpl_module_sort_idx"
  ON "lab_test_preset_templates"("module_slug", "sort_order");

CREATE TABLE "user_lab_test_presets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "lab_test_type_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_lab_test_presets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_lab_test_preset_config_key"
  ON "user_lab_test_presets"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_lab_test_preset_user_config_idx"
  ON "user_lab_test_presets"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_lab_test_presets"
  ADD CONSTRAINT "user_lab_test_presets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_lab_test_presets"
  ADD CONSTRAINT "user_lab_test_presets_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
