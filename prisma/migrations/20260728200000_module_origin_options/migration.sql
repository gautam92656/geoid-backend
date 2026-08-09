-- Common origin-option catalog (defaults per module)
CREATE TABLE "log_configuration_origin_option_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "name_in_description" VARCHAR(200),
    "code_in_description" VARCHAR(100),
    "classification_code_override" BOOLEAN NOT NULL DEFAULT false,
    "type" VARCHAR(50) NOT NULL DEFAULT 'Soil',
    "color" VARCHAR(100),
    "apply_color_to_pdf" BOOLEAN NOT NULL DEFAULT false,
    "override_graphic" BOOLEAN NOT NULL DEFAULT false,
    "split_graphic" BOOLEAN NOT NULL DEFAULT false,
    "graphic" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_origin_option_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "log_configuration_origin_option_templates_module_slug_optio_key"
  ON "log_configuration_origin_option_templates"("module_slug", "option_key");

CREATE INDEX "log_configuration_origin_option_templates_module_slug_sort__idx"
  ON "log_configuration_origin_option_templates"("module_slug", "sort_order");

-- Per-user customized origin options
CREATE TABLE "log_configuration_user_origin_options" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "name_in_description" VARCHAR(200),
    "code_in_description" VARCHAR(100),
    "classification_code_override" BOOLEAN NOT NULL DEFAULT false,
    "type" VARCHAR(50) NOT NULL DEFAULT 'Soil',
    "color" VARCHAR(100),
    "apply_color_to_pdf" BOOLEAN NOT NULL DEFAULT false,
    "override_graphic" BOOLEAN NOT NULL DEFAULT false,
    "split_graphic" BOOLEAN NOT NULL DEFAULT false,
    "graphic" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_user_origin_options_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "log_configuration_user_origin_options_user_id_module_slug_o_key"
  ON "log_configuration_user_origin_options"("user_id", "module_slug", "option_key");

CREATE INDEX "log_configuration_user_origin_options_user_id_module_slug_s_idx"
  ON "log_configuration_user_origin_options"("user_id", "module_slug", "sort_order");

ALTER TABLE "log_configuration_user_origin_options"
  ADD CONSTRAINT "log_configuration_user_origin_options_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
