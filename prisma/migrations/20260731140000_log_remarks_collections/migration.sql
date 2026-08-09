-- Dedicated Log Remarks modal collections (remark types + quick notes).

CREATE TABLE "remark_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "remark_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "remark_type_tpl_module_key"
  ON "remark_type_templates"("module_slug", "option_key");
CREATE INDEX "remark_type_tpl_module_sort_idx"
  ON "remark_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_remark_types" (
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
    CONSTRAINT "user_remark_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_remark_type_config_key"
  ON "user_remark_types"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_remark_type_user_config_idx"
  ON "user_remark_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_remark_types"
  ADD CONSTRAINT "user_remark_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_remark_types"
  ADD CONSTRAINT "user_remark_types_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "remarks_quick_note_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "remark_type_id" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "remarks_quick_note_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "remarks_qn_tpl_module_key"
  ON "remarks_quick_note_templates"("module_slug", "option_key");
CREATE INDEX "remarks_qn_tpl_module_sort_idx"
  ON "remarks_quick_note_templates"("module_slug", "sort_order");

CREATE TABLE "user_remarks_quick_notes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "remark_type_id" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "user_remarks_quick_notes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_remarks_qn_config_key"
  ON "user_remarks_quick_notes"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_remarks_qn_user_config_idx"
  ON "user_remarks_quick_notes"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_remarks_quick_notes"
  ADD CONSTRAINT "user_remarks_quick_notes_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_remarks_quick_notes"
  ADD CONSTRAINT "user_remarks_quick_notes_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
