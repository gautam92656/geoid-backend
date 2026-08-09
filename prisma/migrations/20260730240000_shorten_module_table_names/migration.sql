-- Shorten module-related table names by dropping the log_configuration_ prefix.

ALTER TABLE IF EXISTS "log_configuration_modules" RENAME TO "modules";
ALTER TABLE IF EXISTS "log_configuration_user_modules" RENAME TO "user_modules";
ALTER TABLE IF EXISTS "log_configuration_workflow_templates" RENAME TO "workflow_templates";
ALTER TABLE IF EXISTS "log_configuration_user_workflows" RENAME TO "user_workflows";
ALTER TABLE IF EXISTS "log_configuration_origin_option_templates" RENAME TO "origin_option_templates";
ALTER TABLE IF EXISTS "log_configuration_user_origin_options" RENAME TO "user_origin_options";
ALTER TABLE IF EXISTS "log_configuration_data_type_option_templates" RENAME TO "data_type_option_templates";
ALTER TABLE IF EXISTS "log_configuration_user_data_type_options" RENAME TO "user_data_type_options";
ALTER TABLE IF EXISTS "log_configuration_insitu_test_type_templates" RENAME TO "insitu_test_type_templates";
ALTER TABLE IF EXISTS "log_configuration_user_insitu_test_types" RENAME TO "user_insitu_test_types";
ALTER TABLE IF EXISTS "log_configuration_insitu_unit_setting_templates" RENAME TO "insitu_unit_setting_templates";
ALTER TABLE IF EXISTS "log_configuration_user_insitu_unit_settings" RENAME TO "user_insitu_unit_settings";

-- Rename constraints / indexes that still use the old lc_* names where they exist.
ALTER INDEX IF EXISTS "lc_user_modules_config_slug_key" RENAME TO "user_modules_config_slug_key";
ALTER INDEX IF EXISTS "lc_user_modules_config_source_key" RENAME TO "user_modules_config_source_key";
ALTER INDEX IF EXISTS "lc_user_modules_user_config_idx" RENAME TO "user_modules_user_config_idx";
ALTER INDEX IF EXISTS "lc_user_modules_config_avail_idx" RENAME TO "user_modules_config_avail_idx";

ALTER INDEX IF EXISTS "lc_user_workflows_config_module_key" RENAME TO "user_workflows_config_module_key";
ALTER INDEX IF EXISTS "lc_user_workflows_user_config_module_idx" RENAME TO "user_workflows_user_config_module_idx";

ALTER INDEX IF EXISTS "lc_user_origins_config_module_key_key" RENAME TO "user_origins_config_module_key_key";
ALTER INDEX IF EXISTS "lc_user_origins_user_config_module_idx" RENAME TO "user_origins_user_config_module_idx";

ALTER INDEX IF EXISTS "lc_user_dtype_opts_config_key" RENAME TO "user_dtype_opts_config_key";
ALTER INDEX IF EXISTS "lc_user_dtype_opts_user_config_idx" RENAME TO "user_dtype_opts_user_config_idx";

ALTER INDEX IF EXISTS "lc_insitu_type_tpl_module_key" RENAME TO "insitu_type_tpl_module_key";
ALTER INDEX IF EXISTS "lc_insitu_type_tpl_module_sort_idx" RENAME TO "insitu_type_tpl_module_sort_idx";
ALTER INDEX IF EXISTS "lc_user_insitu_types_config_key" RENAME TO "user_insitu_types_config_key";
ALTER INDEX IF EXISTS "lc_user_insitu_types_user_config_idx" RENAME TO "user_insitu_types_user_config_idx";

ALTER INDEX IF EXISTS "lc_insitu_unit_tpl_module_key" RENAME TO "insitu_unit_tpl_module_key";
ALTER INDEX IF EXISTS "lc_insitu_unit_tpl_module_sort_idx" RENAME TO "insitu_unit_tpl_module_sort_idx";
ALTER INDEX IF EXISTS "lc_user_insitu_units_config_key" RENAME TO "user_insitu_units_config_key";
ALTER INDEX IF EXISTS "lc_user_insitu_units_user_config_idx" RENAME TO "user_insitu_units_user_config_idx";
