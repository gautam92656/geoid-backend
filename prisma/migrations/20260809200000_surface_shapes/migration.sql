-- Dedicated Core Logging surface shape collections.

CREATE TABLE "surface_shape_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "option_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "surface_shape_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "surface_shape_tpl_module_key"
  ON "surface_shape_templates"("module_slug", "option_key");

CREATE INDEX "surface_shape_tpl_module_sort_idx"
  ON "surface_shape_templates"("module_slug", "sort_order");

CREATE TABLE "user_surface_shapes" (
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

    CONSTRAINT "user_surface_shapes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_surface_shape_config_key"
  ON "user_surface_shapes"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "user_surface_shape_user_config_idx"
  ON "user_surface_shapes"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "user_surface_shapes"
  ADD CONSTRAINT "user_surface_shapes_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_surface_shapes"
  ADD CONSTRAINT "user_surface_shapes_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
