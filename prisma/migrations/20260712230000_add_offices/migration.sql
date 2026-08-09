-- CreateTable
CREATE TABLE "offices" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(500),
    "phone" VARCHAR(20),
    "external_id" VARCHAR(100),
    "office_number" VARCHAR(100),
    "state" VARCHAR(100),
    "laboratory" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
