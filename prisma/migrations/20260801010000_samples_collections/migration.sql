-- Samples dedicated collection (sample types).

CREATE TABLE "sample_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "sample_abbreviation" VARCHAR(100),
    "note_recovery" BOOLEAN NOT NULL DEFAULT false,
    "display_qc_id" BOOLEAN NOT NULL DEFAULT false,
    "enable_segregated_graphic" BOOLEAN NOT NULL DEFAULT false,
    "top_graphic" VARCHAR(255),
    "bottom_graphic" VARCHAR(255),
    "enable_subsurface_logging" BOOLEAN NOT NULL DEFAULT false,
    "enable_assign_lab_test" BOOLEAN NOT NULL DEFAULT false,
    "enable_insitu_test_logging" BOOLEAN NOT NULL DEFAULT false,
    "default_insitu_test_type_id" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sample_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sample_type_tpl_module_key"
  ON "sample_type_templates"("module_slug", "option_key");

CREATE INDEX "sample_type_tpl_module_sort_idx"
  ON "sample_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_sample_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "sample_abbreviation" VARCHAR(100),
    "note_recovery" BOOLEAN NOT NULL DEFAULT false,
    "display_qc_id" BOOLEAN NOT NULL DEFAULT false,
    "enable_segregated_graphic" BOOLEAN NOT NULL DEFAULT false,
    "top_graphic" VARCHAR(255),
    "bottom_graphic" VARCHAR(255),
    "enable_subsurface_logging" BOOLEAN NOT NULL DEFAULT false,
    "enable_assign_lab_test" BOOLEAN NOT NULL DEFAULT false,
    "enable_insitu_test_logging" BOOLEAN NOT NULL DEFAULT false,
    "default_insitu_test_type_id" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_sample_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_sample_type_config_key"
  ON "user_sample_types"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_sample_type_user_config_idx"
  ON "user_sample_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_sample_types"
  ADD CONSTRAINT "user_sample_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_sample_types"
  ADD CONSTRAINT "user_sample_types_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
