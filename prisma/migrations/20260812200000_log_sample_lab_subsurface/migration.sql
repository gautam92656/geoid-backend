-- Add lab-test assignment + subsurface classification fields to log_samples
ALTER TABLE "log_samples"
  ADD COLUMN IF NOT EXISTS "lab_test_request_id" VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "lab_test_request_name" VARCHAR(200) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "lab_test_type_ids" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "subsurface_classification" VARCHAR(200) NOT NULL DEFAULT '';
