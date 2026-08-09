-- AlterTable
ALTER TABLE "log_configuration_modules" ADD COLUMN "source_slug" VARCHAR(100);
ALTER TABLE "log_configuration_modules" ADD COLUMN "settings" JSONB;

-- CreateIndex
CREATE INDEX "log_configuration_modules_user_id_source_slug_idx" ON "log_configuration_modules"("user_id", "source_slug");

-- One active user customization per template
CREATE UNIQUE INDEX "log_configuration_modules_user_source_uidx"
  ON "log_configuration_modules"("user_id", "source_slug")
  WHERE "scope" = 'user' AND "source_slug" IS NOT NULL AND "deleted_at" IS NULL;
