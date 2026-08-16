-- AlterTable: link insitu tests to samples
ALTER TABLE "log_insitu_tests"
  ADD COLUMN IF NOT EXISTS "sample_id" INTEGER;

CREATE INDEX IF NOT EXISTS "log_insitu_tests_sample_id_deleted_at_idx"
  ON "log_insitu_tests"("sample_id", "deleted_at");

DO $$ BEGIN
  ALTER TABLE "log_insitu_tests"
    ADD CONSTRAINT "log_insitu_tests_sample_id_fkey"
    FOREIGN KEY ("sample_id") REFERENCES "log_samples"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
