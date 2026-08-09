-- CreateTable: per-user module customizations
CREATE TABLE "log_configuration_user_modules" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "source_slug" VARCHAR(100),
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "filter_categories" TEXT[],
    "settings" JSONB,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_configuration_user_modules_pkey" PRIMARY KEY ("id")
);

-- Migrate existing user-scoped rows out of the shared catalog table
INSERT INTO "log_configuration_user_modules" (
    "id",
    "user_id",
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
    "id",
    "user_id",
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
FROM "log_configuration_modules"
WHERE "scope" = 'user' AND "user_id" IS NOT NULL;

SELECT setval(
    pg_get_serial_sequence('log_configuration_user_modules', 'id'),
    COALESCE((SELECT MAX(id) FROM "log_configuration_user_modules"), 1),
    true
);

DELETE FROM "log_configuration_modules" WHERE "scope" = 'user';

-- DropForeignKey
ALTER TABLE "log_configuration_modules" DROP CONSTRAINT IF EXISTS "log_configuration_modules_user_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "log_configuration_modules_scope_user_id_idx";
DROP INDEX IF EXISTS "log_configuration_modules_user_id_source_slug_idx";
DROP INDEX IF EXISTS "log_configuration_modules_user_source_uidx";

-- AlterTable: common catalog only
ALTER TABLE "log_configuration_modules" DROP COLUMN IF EXISTS "scope";
ALTER TABLE "log_configuration_modules" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "log_configuration_modules" DROP COLUMN IF EXISTS "source_slug";
ALTER TABLE "log_configuration_modules" DROP COLUMN IF EXISTS "settings";

-- DropEnum
DROP TYPE IF EXISTS "log_configuration_module_scope";

-- CreateIndex
CREATE UNIQUE INDEX "log_configuration_user_modules_user_id_slug_key"
  ON "log_configuration_user_modules"("user_id", "slug");

CREATE INDEX "log_configuration_user_modules_user_id_source_slug_idx"
  ON "log_configuration_user_modules"("user_id", "source_slug");

-- Name matches Prisma's truncated identifier (63-char limit).
CREATE INDEX "log_configuration_user_modules_user_id_is_available_sort_or_idx"
  ON "log_configuration_user_modules"("user_id", "is_available", "sort_order");

-- AddForeignKey
ALTER TABLE "log_configuration_user_modules"
  ADD CONSTRAINT "log_configuration_user_modules_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
