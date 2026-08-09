-- prisma-migrate disable-transaction

-- CreateEnum
CREATE TYPE "log_configuration_status" AS ENUM ('active', 'inactive');

-- AlterEnum
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'in_planning';
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'onsite_works';
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'onsite_works_completed';
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'lab_testing';
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'reporting';
ALTER TYPE "project_status" ADD VALUE IF NOT EXISTS 'complete';

-- CreateTable
CREATE TABLE "log_configurations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "status" "log_configuration_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "log_configurations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "log_configurations" ADD CONSTRAINT "log_configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
