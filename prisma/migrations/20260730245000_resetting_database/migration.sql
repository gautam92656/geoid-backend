-- AlterTable
ALTER TABLE "data_type_option_templates" RENAME CONSTRAINT "log_configuration_data_type_option_templates_pkey" TO "data_type_option_templates_pkey";

-- AlterTable
ALTER TABLE "insitu_test_type_templates" RENAME CONSTRAINT "log_configuration_insitu_test_type_templates_pkey" TO "insitu_test_type_templates_pkey";

-- AlterTable
ALTER TABLE "insitu_unit_setting_templates" RENAME CONSTRAINT "log_configuration_insitu_unit_setting_templates_pkey" TO "insitu_unit_setting_templates_pkey";

-- AlterTable
ALTER TABLE "modules" RENAME CONSTRAINT "log_configuration_modules_pkey" TO "modules_pkey";

-- AlterTable
ALTER TABLE "origin_option_templates" RENAME CONSTRAINT "log_configuration_origin_option_templates_pkey" TO "origin_option_templates_pkey";

-- AlterTable
ALTER TABLE "user_data_type_options" RENAME CONSTRAINT "log_configuration_user_data_type_options_pkey" TO "user_data_type_options_pkey";

-- AlterTable
ALTER TABLE "user_insitu_test_types" RENAME CONSTRAINT "log_configuration_user_insitu_test_types_pkey" TO "user_insitu_test_types_pkey";

-- AlterTable
ALTER TABLE "user_insitu_unit_settings" RENAME CONSTRAINT "log_configuration_user_insitu_unit_settings_pkey" TO "user_insitu_unit_settings_pkey";

-- AlterTable
ALTER TABLE "user_modules" RENAME CONSTRAINT "log_configuration_user_modules_pkey" TO "user_modules_pkey";

-- AlterTable
ALTER TABLE "user_origin_options" RENAME CONSTRAINT "log_configuration_user_origin_options_pkey" TO "user_origin_options_pkey";

-- AlterTable
ALTER TABLE "user_workflows" RENAME CONSTRAINT "log_configuration_user_workflows_pkey" TO "user_workflows_pkey";

-- AlterTable
ALTER TABLE "workflow_templates" RENAME CONSTRAINT "log_configuration_workflow_templates_pkey" TO "workflow_templates_pkey";

-- RenameForeignKey
ALTER TABLE "user_data_type_options" RENAME CONSTRAINT "log_configuration_user_data_type_options_log_configuration_id_f" TO "user_data_type_options_log_configuration_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_data_type_options" RENAME CONSTRAINT "log_configuration_user_data_type_options_user_id_fkey" TO "user_data_type_options_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_insitu_test_types" RENAME CONSTRAINT "log_configuration_user_insitu_test_types_log_configuration_id_f" TO "user_insitu_test_types_log_configuration_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_insitu_test_types" RENAME CONSTRAINT "log_configuration_user_insitu_test_types_user_id_fkey" TO "user_insitu_test_types_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_insitu_unit_settings" RENAME CONSTRAINT "log_configuration_user_insitu_unit_settings_log_configuration_i" TO "user_insitu_unit_settings_log_configuration_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_insitu_unit_settings" RENAME CONSTRAINT "log_configuration_user_insitu_unit_settings_user_id_fkey" TO "user_insitu_unit_settings_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_modules" RENAME CONSTRAINT "log_configuration_user_modules_log_configuration_id_fkey" TO "user_modules_log_configuration_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_modules" RENAME CONSTRAINT "log_configuration_user_modules_user_id_fkey" TO "user_modules_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_origin_options" RENAME CONSTRAINT "log_configuration_user_origin_options_log_configuration_id_fkey" TO "user_origin_options_log_configuration_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_origin_options" RENAME CONSTRAINT "log_configuration_user_origin_options_user_id_fkey" TO "user_origin_options_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_workflows" RENAME CONSTRAINT "log_configuration_user_workflows_log_configuration_id_fkey" TO "user_workflows_log_configuration_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_workflows" RENAME CONSTRAINT "log_configuration_user_workflows_user_id_fkey" TO "user_workflows_user_id_fkey";

-- RenameIndex
ALTER INDEX "log_configuration_data_type_option_templates_module_slug_da_idx" RENAME TO "data_type_option_templates_module_slug_data_type_id_sort_or_idx";

-- RenameIndex
ALTER INDEX "log_configuration_data_type_option_templates_module_slug_da_key" RENAME TO "data_type_option_templates_module_slug_data_type_id_option__key";

-- RenameIndex
ALTER INDEX "log_configuration_modules_is_available_sort_order_idx" RENAME TO "modules_is_available_sort_order_idx";

-- RenameIndex
ALTER INDEX "log_configuration_modules_slug_key" RENAME TO "modules_slug_key";

-- RenameIndex
ALTER INDEX "log_configuration_origin_option_templates_module_slug_optio_key" RENAME TO "origin_option_templates_module_slug_option_key_key";

-- RenameIndex
ALTER INDEX "log_configuration_origin_option_templates_module_slug_sort__idx" RENAME TO "origin_option_templates_module_slug_sort_order_idx";

-- RenameIndex
ALTER INDEX "log_configuration_workflow_templates_module_slug_key" RENAME TO "workflow_templates_module_slug_key";
