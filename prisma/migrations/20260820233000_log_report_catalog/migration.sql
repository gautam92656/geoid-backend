-- Common log-report catalog: field codes + DCP graph defaults.
-- Seeded here so `prisma migrate deploy` on a restored database still has the data.

CREATE TABLE "log_report_field_codes" (
    "id" SERIAL NOT NULL,
    "group" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "aliases" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_report_field_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "log_report_field_codes_group_code_key" ON "log_report_field_codes"("group", "code");
CREATE INDEX "log_report_field_codes_group_sort_idx" ON "log_report_field_codes"("group", "sort_order");

CREATE TABLE "log_report_chart_defaults" (
    "id" SERIAL NOT NULL,
    "chart_key" VARCHAR(100) NOT NULL,
    "column_code" VARCHAR(100) NOT NULL,
    "column_text" VARCHAR(200) NOT NULL,
    "data_source_group" VARCHAR(100) NOT NULL,
    "data_source_value" VARCHAR(100) NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_report_chart_defaults_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "log_report_chart_defaults_chart_key_key" ON "log_report_chart_defaults"("chart_key");

INSERT INTO "log_report_field_codes" ("group", "code", "name", "aliases", "sort_order", "created_at", "updated_at") VALUES
('density', 'VL', 'Very Loose', '["vl","very loose","veryloose"]'::jsonb, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('density', 'L', 'Loose', '["l","loose"]'::jsonb, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('density', 'MD', 'Medium Dense', '["md","medium dense","mediumdense","medium"]'::jsonb, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('density', 'D', 'Dense', '["d","dense"]'::jsonb, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('density', 'VD', 'Very Dense', '["vd","very dense","verydense"]'::jsonb, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consistency', 'VS', 'Very Soft', '["vs","very soft","verysoft"]'::jsonb, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consistency', 'S', 'Soft', '["s","soft"]'::jsonb, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consistency', 'F', 'Firm', '["f","firm"]'::jsonb, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consistency', 'St', 'Stiff', '["st","stiff"]'::jsonb, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consistency', 'VSt', 'Very Stiff', '["vst","very stiff","verystiff"]'::jsonb, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consistency', 'H', 'Hard', '["h","hard"]'::jsonb, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consistency', 'FR', 'Friable', '["fr","friable"]'::jsonb, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'D', 'Dry', '["d","dry"]'::jsonb, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'M', 'Moist', '["m","moist"]'::jsonb, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'W', 'Wet', '["w","wet"]'::jsonb, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'w < PL', 'w < PL', '["w < pl","w<pl"]'::jsonb, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'w = PL', 'w = PL', '["w = pl","w=pl"]'::jsonb, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'w > PL', 'w > PL', '["w > pl","w>pl"]'::jsonb, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'w ≈ LL', 'w ≈ LL', '["w ≈ ll","w = ll","w=ll","w≈ll","approximately ll"]'::jsonb, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('moisture', 'w > LL', 'w > LL', '["w > ll","w>ll"]'::jsonb, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "log_report_chart_defaults" (
  "chart_key",
  "column_code",
  "column_text",
  "data_source_group",
  "data_source_value",
  "config",
  "created_at",
  "updated_at"
) VALUES (
  'dcp_graph',
  'column_1734655921756',
  'DCP Graph',
  'all_testings',
  'DCP',
  '{"chart_type":"scatter_line_chart","column_data_source":{"group":"all_testings","value":"DCP"},"fill_color":"#83BEEC","line_color":"#83BEEC","line_type":"solid_around","chart_transparency_width":"20","chart_layer":"bottom","symbol_type":"circle","symbol_color":"#83BEEC","axis_bounds_min":0,"axis_bounds_max":"25","axis_units_minor":"5","axis_units_major":2,"axis_label":true,"fontSize":8,"hide_chart_name_graphic":true,"text_visibility":true,"is_data_present":false,"name_vertical":false,"name_parent_vertical":false,"text":"","code":"column_1734655921756","selectedMultiChartOptions":[{"name":"DCP","code":"column_1734655921756","group_code":"all_testings","data":"","chart_type":"scatter_line_chart","column_data_source":{"group":"all_testings","value":"DCP"},"fill_color":"#83BEEC","line_color":"#83BEEC","line_type":"solid_around","chart_transparency_width":"20","chart_layer":"bottom","symbol_type":"symbol_01","symbol_color":"#000000","axis_bounds_min":0,"axis_bounds_max":"25","axis_units_minor":"5","axis_units_major":2,"axis_label":true,"fontSize":8,"hide_chart_name_graphic":true,"text_visibility":true,"is_data_present":false,"name_vertical":false,"name_parent_vertical":false,"text":"DCP Graph","line_visibility":true,"symbol_visibility":true}],"symbol_visibility":true,"line_visibility":true,"axis_order":0}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
