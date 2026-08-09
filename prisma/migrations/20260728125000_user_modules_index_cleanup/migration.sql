-- Ensure final schema matches Prisma (safe if indexes were never created).
DROP INDEX IF EXISTS "log_configuration_user_modules_user_source_uidx";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND n.nspname = 'public'
      AND c.relname = 'log_configuration_user_modules_user_id_is_available_sort_order_idx'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND n.nspname = 'public'
      AND c.relname = 'log_configuration_user_modules_user_id_is_available_sort_or_idx'
  ) THEN
    ALTER INDEX "log_configuration_user_modules_user_id_is_available_sort_order_idx"
      RENAME TO "log_configuration_user_modules_user_id_is_available_sort_or_idx";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND n.nspname = 'public'
      AND c.relname = 'log_configuration_user_modules_user_id_is_available_sort_order_'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND n.nspname = 'public'
      AND c.relname = 'log_configuration_user_modules_user_id_is_available_sort_or_idx'
  ) THEN
    ALTER INDEX "log_configuration_user_modules_user_id_is_available_sort_order_"
      RENAME TO "log_configuration_user_modules_user_id_is_available_sort_or_idx";
  END IF;
END $$;
