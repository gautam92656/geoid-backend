-- CreateEnum
CREATE TYPE "client_status" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "company_contact" VARCHAR(200),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "external_id" VARCHAR(100),
    "status" "client_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);
