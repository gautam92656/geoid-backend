-- Add optional address field for bore/log records
ALTER TABLE "logs" ADD COLUMN IF NOT EXISTS "address" VARCHAR(500);
