-- AlterTable
ALTER TABLE "classification_graphics" ADD COLUMN "code" VARCHAR(255) NOT NULL DEFAULT '';

-- Backfill code from filename where empty
UPDATE "classification_graphics"
SET "code" = regexp_replace("filename", '\.png$', '', 'i')
WHERE "code" = '';
