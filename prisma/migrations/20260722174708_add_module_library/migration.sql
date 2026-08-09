-- AlterTable
ALTER TABLE "log_configuration_field_options" ALTER COLUMN "updated_at" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "log_configuration_field_options_log_configuration_id_field_grou" RENAME TO "log_configuration_field_options_log_configuration_id_field__idx";
