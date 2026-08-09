-- CreateEnum
CREATE TYPE "log_status" AS ENUM ('to_do', 'in_progress', 'field', 'lab', 'completed', 'preliminary', 'draft', 'final', 'in_active');

-- CreateEnum
CREATE TYPE "log_type" AS ENUM ('borelog', 'test_pit', 'probe', 'monitoring_well', 'inclined_borehole');

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "proposed_borelog_id" INTEGER,
    "log_number" VARCHAR(50) NOT NULL,
    "log_config_id" VARCHAR(100) NOT NULL,
    "logType" "log_type" NOT NULL,
    "log_status" "log_status" NOT NULL DEFAULT 'to_do',
    "drilling_date" DATE,
    "drilling_time" VARCHAR(10),
    "finish_log_date" DATE,
    "finish_log_time" VARCHAR(10),
    "end_depth" VARCHAR(50),
    "finishing_reason" VARCHAR(200),
    "finishing_comment" TEXT,
    "coordinate_system" VARCHAR(100),
    "latitude" VARCHAR(50),
    "longitude" VARCHAR(50),
    "easting" VARCHAR(50),
    "northing" VARCHAR(50),
    "utm_zone" VARCHAR(50),
    "elevation" VARCHAR(50),
    "station" VARCHAR(100),
    "location_comment" TEXT,
    "supplier_id" INTEGER,
    "equipment_id" INTEGER,
    "logged_by" VARCHAR(200),
    "reviewed_by" VARCHAR(200),
    "inclination" VARCHAR(50),
    "azimuth" VARCHAR(50),
    "general_comments" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "logs_project_id_log_number_key" ON "logs"("project_id", "log_number");

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_proposed_borelog_id_fkey" FOREIGN KEY ("proposed_borelog_id") REFERENCES "logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
