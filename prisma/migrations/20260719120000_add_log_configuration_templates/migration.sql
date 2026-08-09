-- CreateEnum
CREATE TYPE "log_configuration_template_discipline" AS ENUM ('Geotechnical', 'Environmental');

-- CreateTable
CREATE TABLE "log_configuration_templates" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "region" VARCHAR(10) NOT NULL,
    "disciplines" "log_configuration_template_discipline"[],
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_configuration_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "log_configuration_templates_slug_key" ON "log_configuration_templates"("slug");
