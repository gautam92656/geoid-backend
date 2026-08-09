-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('to_do', 'in_progress', 'completed');

-- Add user_id to clients
ALTER TABLE "clients" ADD COLUMN "user_id" INTEGER;

UPDATE "clients"
SET "user_id" = (SELECT "id" FROM "users" WHERE "email" = 'geo@geoid.com' AND "deleted_at" IS NULL ORDER BY "id" LIMIT 1)
WHERE "user_id" IS NULL;

UPDATE "clients" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "id" LIMIT 1) WHERE "user_id" IS NULL;

ALTER TABLE "clients" ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "clients_company_name_active_unique";
DROP INDEX IF EXISTS "clients_email_active_unique";

CREATE UNIQUE INDEX "clients_user_company_name_active_unique"
ON "clients" ("user_id", LOWER("company_name"))
WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "clients_user_email_active_unique"
ON "clients" ("user_id", LOWER("email"))
WHERE "deleted_at" IS NULL AND "email" IS NOT NULL;

-- Add user_id to suppliers
ALTER TABLE "suppliers" ADD COLUMN "user_id" INTEGER;

UPDATE "suppliers"
SET "user_id" = (SELECT "id" FROM "users" WHERE "email" = 'geo@geoid.com' AND "deleted_at" IS NULL ORDER BY "id" LIMIT 1)
WHERE "user_id" IS NULL;

UPDATE "suppliers" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "id" LIMIT 1) WHERE "user_id" IS NULL;

ALTER TABLE "suppliers" ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "suppliers_user_business_name_active_unique"
ON "suppliers" ("user_id", LOWER("business_name"))
WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "suppliers_user_email_active_unique"
ON "suppliers" ("user_id", LOWER("email"))
WHERE "deleted_at" IS NULL AND "email" IS NOT NULL;

-- Create projects table
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_no" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(500),
    "status" "project_status" NOT NULL DEFAULT 'to_do',
    "brief" TEXT,
    "assignee" VARCHAR(100),
    "log_config_id" VARCHAR(100),
    "client_id" INTEGER,
    "office" VARCHAR(200),
    "start_date" DATE,
    "end_date" DATE,
    "coordinate_system" VARCHAR(100),
    "latitude" VARCHAR(50),
    "longitude" VARCHAR(50),
    "easting" VARCHAR(50),
    "northing" VARCHAR(50),
    "utm_zone" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "projects_user_id_project_no_key" ON "projects"("user_id", "project_no");

ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
