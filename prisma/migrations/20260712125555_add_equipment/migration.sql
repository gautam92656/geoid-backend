-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "equipment_no" VARCHAR(100),
    "equipment_name" VARCHAR(200),
    "suppliers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mounting" VARCHAR(200),
    "drive_weight" VARCHAR(100),
    "drop" VARCHAR(100),
    "manufacturer" VARCHAR(200),
    "model" VARCHAR(200),
    "energy_transfer_ratio" VARCHAR(50),
    "hammer_efficiency_correction" VARCHAR(50),
    "net_area_ratio" VARCHAR(50),
    "tip_area" VARCHAR(50),
    "friction_ratio" VARCHAR(50),
    "pore_pressure_transducer_location" TEXT,
    "friction_reducer_type" VARCHAR(200),
    "friction_reducer" VARCHAR(200),
    "calibrated_by" VARCHAR(200),
    "date_of_calibration" DATE,
    "bucket_width" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
