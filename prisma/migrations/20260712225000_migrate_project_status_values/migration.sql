-- Migrate legacy project statuses (separate migration so new enum values are committed first)
UPDATE "projects" SET "status" = 'complete' WHERE "status" = 'completed';
UPDATE "projects" SET "status" = 'onsite_works' WHERE "status" = 'in_progress';
