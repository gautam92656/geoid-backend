-- Well Logs dedicated collections

CREATE TABLE "well_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "well_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "well_type_tpl_module_key" ON "well_type_templates"("module_slug", "option_key");
CREATE INDEX "well_type_tpl_module_sort_idx" ON "well_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_well_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_well_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_well_type_config_key" ON "user_well_types"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_well_type_user_config_idx" ON "user_well_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_well_types" ADD CONSTRAINT "user_well_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_well_types" ADD CONSTRAINT "user_well_types_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "well_casing_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "type" VARCHAR(20) NOT NULL DEFAULT 'surface',
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "well_casing_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "well_casing_tpl_module_key" ON "well_casing_type_templates"("module_slug", "option_key");
CREATE INDEX "well_casing_tpl_module_sort_idx" ON "well_casing_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_well_casing_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "type" VARCHAR(20) NOT NULL DEFAULT 'surface',
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_well_casing_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_well_casing_config_key" ON "user_well_casing_types"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_well_casing_user_config_idx" ON "user_well_casing_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_well_casing_types" ADD CONSTRAINT "user_well_casing_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_well_casing_types" ADD CONSTRAINT "user_well_casing_types_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "well_casing_top_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "well_casing_top_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "well_casing_top_tpl_module_key" ON "well_casing_top_templates"("module_slug", "option_key");
CREATE INDEX "well_casing_top_tpl_module_sort_idx" ON "well_casing_top_templates"("module_slug", "sort_order");

CREATE TABLE "user_well_casing_tops" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_well_casing_tops_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_well_casing_top_config_key" ON "user_well_casing_tops"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_well_casing_top_user_config_idx" ON "user_well_casing_tops"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_well_casing_tops" ADD CONSTRAINT "user_well_casing_tops_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_well_casing_tops" ADD CONSTRAINT "user_well_casing_tops_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "well_cover_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false,
    "graphic_alignment" VARCHAR(20) NOT NULL DEFAULT 'bottom',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "well_cover_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "well_cover_tpl_module_key" ON "well_cover_type_templates"("module_slug", "option_key");
CREATE INDEX "well_cover_tpl_module_sort_idx" ON "well_cover_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_well_cover_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "allow_negative_depth" BOOLEAN NOT NULL DEFAULT false,
    "graphic_alignment" VARCHAR(20) NOT NULL DEFAULT 'bottom',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_well_cover_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_well_cover_config_key" ON "user_well_cover_types"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_well_cover_user_config_idx" ON "user_well_cover_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_well_cover_types" ADD CONSTRAINT "user_well_cover_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_well_cover_types" ADD CONSTRAINT "user_well_cover_types_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "well_probe_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "record_depth_to" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "well_probe_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "well_probe_tpl_module_key" ON "well_probe_type_templates"("module_slug", "option_key");
CREATE INDEX "well_probe_tpl_module_sort_idx" ON "well_probe_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_well_probe_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "record_depth_to" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_well_probe_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_well_probe_config_key" ON "user_well_probe_types"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_well_probe_user_config_idx" ON "user_well_probe_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_well_probe_types" ADD CONSTRAINT "user_well_probe_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_well_probe_types" ADD CONSTRAINT "user_well_probe_types_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "well_backfill_type_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "well_backfill_type_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "well_backfill_tpl_module_key" ON "well_backfill_type_templates"("module_slug", "option_key");
CREATE INDEX "well_backfill_tpl_module_sort_idx" ON "well_backfill_type_templates"("module_slug", "sort_order");

CREATE TABLE "user_well_backfill_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "source_template_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "tablogs_alias" VARCHAR(100),
    "graphic" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_well_backfill_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_well_backfill_config_key" ON "user_well_backfill_types"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_well_backfill_user_config_idx" ON "user_well_backfill_types"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_well_backfill_types" ADD CONSTRAINT "user_well_backfill_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_well_backfill_types" ADD CONSTRAINT "user_well_backfill_types_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "well_default_well_id_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "well_default_well_id_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "well_def_id_tpl_module_key" ON "well_default_well_id_templates"("module_slug", "option_key");
CREATE INDEX "well_def_id_tpl_module_sort_idx" ON "well_default_well_id_templates"("module_slug", "sort_order");

CREATE TABLE "user_well_default_well_ids" (
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

    CONSTRAINT "user_well_default_well_ids_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_well_def_id_config_key" ON "user_well_default_well_ids"("log_configuration_id", "module_slug", "option_key");
CREATE INDEX "user_well_def_id_user_config_idx" ON "user_well_default_well_ids"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_well_default_well_ids" ADD CONSTRAINT "user_well_default_well_ids_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_well_default_well_ids" ADD CONSTRAINT "user_well_default_well_ids_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
