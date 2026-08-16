-- Dedicated Core Logging defect openness collections.

CREATE TABLE "defect_openness_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "defect_openness_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "defect_openness_tpl_module_key"
  ON "defect_openness_templates"("module_slug", "option_key");

CREATE INDEX "defect_openness_tpl_module_sort_idx"
  ON "defect_openness_templates"("module_slug", "sort_order");

CREATE TABLE "user_defect_opennesses" (
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

    CONSTRAINT "user_defect_opennesses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_defect_openness_config_key"
  ON "user_defect_opennesses"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_defect_openness_user_config_idx"
  ON "user_defect_opennesses"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_defect_opennesses"
  ADD CONSTRAINT "user_defect_opennesses_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_defect_opennesses"
  ADD CONSTRAINT "user_defect_opennesses_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
