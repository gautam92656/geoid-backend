-- Remove address field from bore/log records
ALTER TABLE "logs" DROP COLUMN IF EXISTS "address";
