-- CreateTable
CREATE TABLE "log_configuration_field_options" (
    "id" SERIAL NOT NULL,
    "log_configuration_id" INTEGER NOT NULL,
    "field_group" VARCHAR(50) NOT NULL,
    "field_key" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_configuration_field_options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "log_configuration_field_options" ADD CONSTRAINT "log_configuration_field_options_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "log_configuration_field_options_log_configuration_id_field_group_field_key_idx" ON "log_configuration_field_options"("log_configuration_id", "field_group", "field_key");

-- Migrate project detail field options from JSON
INSERT INTO "log_configuration_field_options" ("log_configuration_id", "field_group", "field_key", "name", "sort_order")
SELECT lc.id, 'project_detail', 'district', elem.value, (elem.ordinality - 1)::int
FROM "log_configurations" lc
CROSS JOIN LATERAL jsonb_array_elements_text(
  COALESCE(lc.project_detail_fields->'options'->'district', '[]'::jsonb)
) WITH ORDINALITY AS elem(value, ordinality)
WHERE jsonb_array_length(COALESCE(lc.project_detail_fields->'options'->'district', '[]'::jsonb)) > 0;

INSERT INTO "log_configuration_field_options" ("log_configuration_id", "field_group", "field_key", "name", "sort_order")
SELECT lc.id, 'project_detail', 'serviceLine', elem.value, (elem.ordinality - 1)::int
FROM "log_configurations" lc
CROSS JOIN LATERAL jsonb_array_elements_text(
  COALESCE(lc.project_detail_fields->'options'->'serviceLine', '[]'::jsonb)
) WITH ORDINALITY AS elem(value, ordinality)
WHERE jsonb_array_length(COALESCE(lc.project_detail_fields->'options'->'serviceLine', '[]'::jsonb)) > 0;

INSERT INTO "log_configuration_field_options" ("log_configuration_id", "field_group", "field_key", "name", "sort_order")
SELECT lc.id, 'project_detail', 'serviceArea', elem.value, (elem.ordinality - 1)::int
FROM "log_configurations" lc
CROSS JOIN LATERAL jsonb_array_elements_text(
  COALESCE(lc.project_detail_fields->'options'->'serviceArea', '[]'::jsonb)
) WITH ORDINALITY AS elem(value, ordinality)
WHERE jsonb_array_length(COALESCE(lc.project_detail_fields->'options'->'serviceArea', '[]'::jsonb)) > 0;

-- Migrate log detail field options from JSON
INSERT INTO "log_configuration_field_options" ("log_configuration_id", "field_group", "field_key", "name", "sort_order")
SELECT lc.id, 'log_detail', 'logType', elem.value, (elem.ordinality - 1)::int
FROM "log_configurations" lc
CROSS JOIN LATERAL jsonb_array_elements_text(
  COALESCE(lc.log_detail_fields->'options'->'logType', '[]'::jsonb)
) WITH ORDINALITY AS elem(value, ordinality)
WHERE jsonb_array_length(COALESCE(lc.log_detail_fields->'options'->'logType', '[]'::jsonb)) > 0;

INSERT INTO "log_configuration_field_options" ("log_configuration_id", "field_group", "field_key", "name", "sort_order")
SELECT lc.id, 'log_detail', 'abandonmentMethod', elem.value, (elem.ordinality - 1)::int
FROM "log_configurations" lc
CROSS JOIN LATERAL jsonb_array_elements_text(
  COALESCE(lc.log_detail_fields->'options'->'abandonmentMethod', '[]'::jsonb)
) WITH ORDINALITY AS elem(value, ordinality)
WHERE jsonb_array_length(COALESCE(lc.log_detail_fields->'options'->'abandonmentMethod', '[]'::jsonb)) > 0;

INSERT INTO "log_configuration_field_options" ("log_configuration_id", "field_group", "field_key", "name", "sort_order")
SELECT lc.id, 'log_detail', 'logCarrierType', elem.value, (elem.ordinality - 1)::int
FROM "log_configurations" lc
CROSS JOIN LATERAL jsonb_array_elements_text(
  COALESCE(lc.log_detail_fields->'options'->'logCarrierType', '[]'::jsonb)
) WITH ORDINALITY AS elem(value, ordinality)
WHERE jsonb_array_length(COALESCE(lc.log_detail_fields->'options'->'logCarrierType', '[]'::jsonb)) > 0;

-- Keep only enabled flags in JSON blobs
UPDATE "log_configurations"
SET
  "project_detail_fields" = CASE
    WHEN "project_detail_fields" ? 'enabled' THEN jsonb_build_object('enabled', "project_detail_fields"->'enabled')
    ELSE '{}'::jsonb
  END,
  "log_detail_fields" = CASE
    WHEN "log_detail_fields" ? 'enabled' THEN jsonb_build_object('enabled', "log_detail_fields"->'enabled')
    ELSE '{}'::jsonb
  END;
