-- Scope user modules / workflows / origins / data-type options to a specific log configuration.
-- Environmental "Insitu Tests" must not share state with Rev2 "Insitu Tests".

-- ---------------------------------------------------------------------------
-- 1. User modules
-- ---------------------------------------------------------------------------
ALTER TABLE "log_configuration_user_modules"
  ADD COLUMN IF NOT EXISTS "log_configuration_id" INTEGER;

-- Soft-delete modules for users with no configurations
UPDATE "log_configuration_user_modules" um
SET
  "deleted_at" = COALESCE(um."deleted_at", CURRENT_TIMESTAMP),
  "is_available" = false
WHERE um."log_configuration_id" IS NULL
  AND um."deleted_at" IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "log_configurations" lc
    WHERE lc."user_id" = um."user_id"
      AND lc."deleted_at" IS NULL
  );

-- Prefer a config that already enables this template/source slug
UPDATE "log_configuration_user_modules" um
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = um."user_id"
    AND lc."deleted_at" IS NULL
    AND (
      um."source_slug" IS NULL
      OR lc."enabled_modules"::jsonb ? um."source_slug"
    )
  ORDER BY
    CASE
      WHEN um."source_slug" IS NOT NULL
        AND lc."enabled_modules"::jsonb ? um."source_slug"
      THEN 0
      ELSE 1
    END,
    lc."id" ASC
  LIMIT 1
)
WHERE um."log_configuration_id" IS NULL
  AND um."deleted_at" IS NULL;

-- Fallback: oldest config for the user
UPDATE "log_configuration_user_modules" um
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = um."user_id"
    AND lc."deleted_at" IS NULL
  ORDER BY lc."id" ASC
  LIMIT 1
)
WHERE um."log_configuration_id" IS NULL
  AND um."deleted_at" IS NULL;

-- Soft-delete any remaining orphans
UPDATE "log_configuration_user_modules"
SET
  "deleted_at" = COALESCE("deleted_at", CURRENT_TIMESTAMP),
  "is_available" = false
WHERE "log_configuration_id" IS NULL
  AND "deleted_at" IS NULL;

-- Clone adopted modules onto every other config that enables the same template
INSERT INTO "log_configuration_user_modules" (
  "user_id",
  "log_configuration_id",
  "source_slug",
  "slug",
  "title",
  "description",
  "tags",
  "filter_categories",
  "settings",
  "is_available",
  "sort_order",
  "created_at",
  "updated_at",
  "deleted_at"
)
SELECT
  um."user_id",
  lc."id",
  um."source_slug",
  'u' || um."user_id"::text || '-c' || lc."id"::text || '-' || um."source_slug",
  um."title",
  um."description",
  um."tags",
  um."filter_categories",
  um."settings",
  um."is_available",
  um."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  NULL
FROM "log_configuration_user_modules" um
JOIN "log_configurations" lc
  ON lc."user_id" = um."user_id"
 AND lc."deleted_at" IS NULL
 AND lc."id" <> um."log_configuration_id"
 AND um."source_slug" IS NOT NULL
 AND lc."enabled_modules"::jsonb ? um."source_slug"
WHERE um."deleted_at" IS NULL
  AND um."log_configuration_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "log_configuration_user_modules" existing
    WHERE existing."log_configuration_id" = lc."id"
      AND existing."source_slug" = um."source_slug"
      AND existing."deleted_at" IS NULL
  );

-- Normalize slugs to include configuration id
UPDATE "log_configuration_user_modules"
SET
  "slug" = 'u' || "user_id"::text || '-c' || "log_configuration_id"::text || '-' || COALESCE("source_slug", "slug"),
  "updated_at" = CURRENT_TIMESTAMP
WHERE "log_configuration_id" IS NOT NULL
  AND "deleted_at" IS NULL
  AND "source_slug" IS NOT NULL
  AND "slug" <> ('u' || "user_id"::text || '-c' || "log_configuration_id"::text || '-' || "source_slug");

-- Drop rows that still cannot be scoped (should be none after soft-delete)
DELETE FROM "log_configuration_user_modules"
WHERE "log_configuration_id" IS NULL;

ALTER TABLE "log_configuration_user_modules"
  ALTER COLUMN "log_configuration_id" SET NOT NULL;

DROP INDEX IF EXISTS "log_configuration_user_modules_user_id_slug_key";
DROP INDEX IF EXISTS "log_configuration_user_modules_user_id_source_slug_idx";
DROP INDEX IF EXISTS "log_configuration_user_modules_user_id_is_available_sort_or_idx";

CREATE UNIQUE INDEX "lc_user_modules_config_slug_key"
  ON "log_configuration_user_modules"("log_configuration_id", "slug");

CREATE UNIQUE INDEX "lc_user_modules_config_source_key"
  ON "log_configuration_user_modules"("log_configuration_id", "source_slug");

CREATE INDEX "lc_user_modules_user_config_idx"
  ON "log_configuration_user_modules"("user_id", "log_configuration_id");

CREATE INDEX "lc_user_modules_config_avail_idx"
  ON "log_configuration_user_modules"("log_configuration_id", "is_available", "sort_order");

ALTER TABLE "log_configuration_user_modules"
  ADD CONSTRAINT "log_configuration_user_modules_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 2. User workflows
-- ---------------------------------------------------------------------------
ALTER TABLE "log_configuration_user_workflows"
  ADD COLUMN IF NOT EXISTS "log_configuration_id" INTEGER;

UPDATE "log_configuration_user_workflows" uw
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = uw."user_id"
    AND lc."deleted_at" IS NULL
    AND lc."enabled_modules"::jsonb ? uw."module_slug"
  ORDER BY lc."id" ASC
  LIMIT 1
)
WHERE uw."log_configuration_id" IS NULL;

UPDATE "log_configuration_user_workflows" uw
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = uw."user_id"
    AND lc."deleted_at" IS NULL
  ORDER BY lc."id" ASC
  LIMIT 1
)
WHERE uw."log_configuration_id" IS NULL;

DELETE FROM "log_configuration_user_workflows"
WHERE "log_configuration_id" IS NULL;

INSERT INTO "log_configuration_user_workflows" (
  "user_id",
  "log_configuration_id",
  "module_slug",
  "name",
  "enabled",
  "apply_classification_rules",
  "ignore_parent_legacy_settings",
  "steps",
  "classification_codes",
  "created_at",
  "updated_at"
)
SELECT
  uw."user_id",
  lc."id",
  uw."module_slug",
  uw."name",
  uw."enabled",
  uw."apply_classification_rules",
  uw."ignore_parent_legacy_settings",
  uw."steps",
  uw."classification_codes",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "log_configuration_user_workflows" uw
JOIN "log_configurations" lc
  ON lc."user_id" = uw."user_id"
 AND lc."deleted_at" IS NULL
 AND lc."id" <> uw."log_configuration_id"
 AND lc."enabled_modules"::jsonb ? uw."module_slug"
WHERE NOT EXISTS (
  SELECT 1
  FROM "log_configuration_user_workflows" existing
  WHERE existing."log_configuration_id" = lc."id"
    AND existing."module_slug" = uw."module_slug"
);

ALTER TABLE "log_configuration_user_workflows"
  ALTER COLUMN "log_configuration_id" SET NOT NULL;

DROP INDEX IF EXISTS "log_configuration_user_workflows_user_id_module_slug_key";
DROP INDEX IF EXISTS "log_configuration_user_workflows_user_id_module_slug_idx";

CREATE UNIQUE INDEX "lc_user_workflows_config_module_key"
  ON "log_configuration_user_workflows"("log_configuration_id", "module_slug");

CREATE INDEX "lc_user_workflows_user_config_module_idx"
  ON "log_configuration_user_workflows"("user_id", "log_configuration_id", "module_slug");

ALTER TABLE "log_configuration_user_workflows"
  ADD CONSTRAINT "log_configuration_user_workflows_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 3. User origin options
-- ---------------------------------------------------------------------------
ALTER TABLE "log_configuration_user_origin_options"
  ADD COLUMN IF NOT EXISTS "log_configuration_id" INTEGER;

UPDATE "log_configuration_user_origin_options" uo
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = uo."user_id"
    AND lc."deleted_at" IS NULL
    AND lc."enabled_modules"::jsonb ? uo."module_slug"
  ORDER BY lc."id" ASC
  LIMIT 1
)
WHERE uo."log_configuration_id" IS NULL;

UPDATE "log_configuration_user_origin_options" uo
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = uo."user_id"
    AND lc."deleted_at" IS NULL
  ORDER BY lc."id" ASC
  LIMIT 1
)
WHERE uo."log_configuration_id" IS NULL;

DELETE FROM "log_configuration_user_origin_options"
WHERE "log_configuration_id" IS NULL;

INSERT INTO "log_configuration_user_origin_options" (
  "user_id",
  "log_configuration_id",
  "module_slug",
  "option_key",
  "source_template_id",
  "name",
  "name_in_description",
  "code_in_description",
  "classification_code_override",
  "type",
  "color",
  "apply_color_to_pdf",
  "override_graphic",
  "split_graphic",
  "graphic",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  uo."user_id",
  lc."id",
  uo."module_slug",
  uo."option_key",
  uo."source_template_id",
  uo."name",
  uo."name_in_description",
  uo."code_in_description",
  uo."classification_code_override",
  uo."type",
  uo."color",
  uo."apply_color_to_pdf",
  uo."override_graphic",
  uo."split_graphic",
  uo."graphic",
  uo."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "log_configuration_user_origin_options" uo
JOIN "log_configurations" lc
  ON lc."user_id" = uo."user_id"
 AND lc."deleted_at" IS NULL
 AND lc."id" <> uo."log_configuration_id"
 AND lc."enabled_modules"::jsonb ? uo."module_slug"
WHERE NOT EXISTS (
  SELECT 1
  FROM "log_configuration_user_origin_options" existing
  WHERE existing."log_configuration_id" = lc."id"
    AND existing."module_slug" = uo."module_slug"
    AND existing."option_key" = uo."option_key"
);

ALTER TABLE "log_configuration_user_origin_options"
  ALTER COLUMN "log_configuration_id" SET NOT NULL;

DROP INDEX IF EXISTS "log_configuration_user_origin_options_user_id_module_slug_o_key";
DROP INDEX IF EXISTS "log_configuration_user_origin_options_user_id_module_slug_s_idx";

CREATE UNIQUE INDEX "lc_user_origins_config_module_key_key"
  ON "log_configuration_user_origin_options"("log_configuration_id", "module_slug", "option_key");

CREATE INDEX "lc_user_origins_user_config_module_idx"
  ON "log_configuration_user_origin_options"("user_id", "log_configuration_id", "module_slug", "sort_order");

ALTER TABLE "log_configuration_user_origin_options"
  ADD CONSTRAINT "log_configuration_user_origin_options_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 4. User data-type options
-- ---------------------------------------------------------------------------
ALTER TABLE "log_configuration_user_data_type_options"
  ADD COLUMN IF NOT EXISTS "log_configuration_id" INTEGER;

UPDATE "log_configuration_user_data_type_options" ud
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = ud."user_id"
    AND lc."deleted_at" IS NULL
    AND lc."enabled_modules"::jsonb ? ud."module_slug"
  ORDER BY lc."id" ASC
  LIMIT 1
)
WHERE ud."log_configuration_id" IS NULL;

UPDATE "log_configuration_user_data_type_options" ud
SET "log_configuration_id" = (
  SELECT lc."id"
  FROM "log_configurations" lc
  WHERE lc."user_id" = ud."user_id"
    AND lc."deleted_at" IS NULL
  ORDER BY lc."id" ASC
  LIMIT 1
)
WHERE ud."log_configuration_id" IS NULL;

DELETE FROM "log_configuration_user_data_type_options"
WHERE "log_configuration_id" IS NULL;

INSERT INTO "log_configuration_user_data_type_options" (
  "user_id",
  "log_configuration_id",
  "module_slug",
  "data_type_id",
  "option_key",
  "source_template_id",
  "name",
  "code",
  "graphic",
  "rock_group",
  "color",
  "overlay_color",
  "text_color",
  "show_auto_scale",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  ud."user_id",
  lc."id",
  ud."module_slug",
  ud."data_type_id",
  ud."option_key",
  ud."source_template_id",
  ud."name",
  ud."code",
  ud."graphic",
  ud."rock_group",
  ud."color",
  ud."overlay_color",
  ud."text_color",
  ud."show_auto_scale",
  ud."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "log_configuration_user_data_type_options" ud
JOIN "log_configurations" lc
  ON lc."user_id" = ud."user_id"
 AND lc."deleted_at" IS NULL
 AND lc."id" <> ud."log_configuration_id"
 AND lc."enabled_modules"::jsonb ? ud."module_slug"
WHERE NOT EXISTS (
  SELECT 1
  FROM "log_configuration_user_data_type_options" existing
  WHERE existing."log_configuration_id" = lc."id"
    AND existing."module_slug" = ud."module_slug"
    AND existing."data_type_id" = ud."data_type_id"
    AND existing."option_key" = ud."option_key"
);

ALTER TABLE "log_configuration_user_data_type_options"
  ALTER COLUMN "log_configuration_id" SET NOT NULL;

DROP INDEX IF EXISTS "log_configuration_user_data_type_options_user_id_module_slu_key";
DROP INDEX IF EXISTS "log_configuration_user_data_type_options_user_id_module_slu_idx";

CREATE UNIQUE INDEX "lc_user_dtype_opts_config_key"
  ON "log_configuration_user_data_type_options"("log_configuration_id", "module_slug", "data_type_id", "option_key");

CREATE INDEX "lc_user_dtype_opts_user_config_idx"
  ON "log_configuration_user_data_type_options"("user_id", "log_configuration_id", "module_slug", "data_type_id", "sort_order");

ALTER TABLE "log_configuration_user_data_type_options"
  ADD CONSTRAINT "log_configuration_user_data_type_options_log_configuration_id_fkey"
  FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
