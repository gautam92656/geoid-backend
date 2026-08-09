-- CreateEnum
CREATE TYPE "supplier_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "supplier_type" AS ENUM ('Laboratory', 'Equipment');

-- CreateEnum
CREATE TYPE "supplier_relationship" AS ENUM ('Internal supplier', 'External supplier');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "business_name" VARCHAR(200) NOT NULL,
    "supplier_type" "supplier_type" NOT NULL,
    "supplier_relationship" "supplier_relationship",
    "supplier_external_id" VARCHAR(100),
    "lab_test_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "address" TEXT,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "abn" VARCHAR(20),
    "status" "supplier_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);
