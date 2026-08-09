-- CreateEnum
CREATE TYPE "log_configuration_module_scope" AS ENUM ('common', 'user');

-- CreateTable
CREATE TABLE "log_configuration_modules" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "filter_categories" TEXT[],
    "scope" "log_configuration_module_scope" NOT NULL DEFAULT 'common',
    "user_id" INTEGER,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_configuration_modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "log_configuration_modules_slug_key" ON "log_configuration_modules"("slug");

-- CreateIndex
CREATE INDEX "log_configuration_modules_scope_user_id_idx" ON "log_configuration_modules"("scope", "user_id");

-- CreateIndex
CREATE INDEX "log_configuration_modules_is_available_sort_order_idx" ON "log_configuration_modules"("is_available", "sort_order");

-- AddForeignKey
ALTER TABLE "log_configuration_modules" ADD CONSTRAINT "log_configuration_modules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
