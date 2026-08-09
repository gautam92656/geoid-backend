-- CreateEnum
CREATE TYPE "equipment_type_status" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "equipment_field_definitions" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "equipment_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_types" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "equipment_type_status" NOT NULL DEFAULT 'active',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "field_config" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "equipment_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_field_definitions_key_key" ON "equipment_field_definitions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_types_user_id_name_key" ON "equipment_types"("user_id", "name");

-- AddForeignKey
ALTER TABLE "equipment_types" ADD CONSTRAINT "equipment_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
