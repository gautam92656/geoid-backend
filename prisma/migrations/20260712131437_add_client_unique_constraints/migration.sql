-- Remove duplicate active clients by company name (keep lowest id)
DELETE FROM "clients" AS a
USING "clients" AS b
WHERE a."id" > b."id"
  AND a."deleted_at" IS NULL
  AND b."deleted_at" IS NULL
  AND LOWER(a."company_name") = LOWER(b."company_name");

-- Remove duplicate active clients by email when set (keep lowest id)
DELETE FROM "clients" AS a
USING "clients" AS b
WHERE a."id" > b."id"
  AND a."deleted_at" IS NULL
  AND b."deleted_at" IS NULL
  AND a."email" IS NOT NULL
  AND b."email" IS NOT NULL
  AND LOWER(a."email") = LOWER(b."email");

-- Unique company name among active (non-deleted) clients
CREATE UNIQUE INDEX "clients_company_name_active_unique"
ON "clients" (LOWER("company_name"))
WHERE "deleted_at" IS NULL;

-- Unique email among active clients when email is set
CREATE UNIQUE INDEX "clients_email_active_unique"
ON "clients" (LOWER("email"))
WHERE "deleted_at" IS NULL AND "email" IS NOT NULL;
