-- Common workflow templates (defaults per module slug)
CREATE TABLE "log_configuration_workflow_templates" (
    "id" SERIAL NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "apply_classification_rules" BOOLEAN NOT NULL DEFAULT true,
    "ignore_parent_legacy_settings" BOOLEAN NOT NULL DEFAULT true,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "classification_codes" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_workflow_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "log_configuration_workflow_templates_module_slug_key"
  ON "log_configuration_workflow_templates"("module_slug");

-- Per-user workflow customizations
CREATE TABLE "log_configuration_user_workflows" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "module_slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "apply_classification_rules" BOOLEAN NOT NULL DEFAULT true,
    "ignore_parent_legacy_settings" BOOLEAN NOT NULL DEFAULT true,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "classification_codes" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "log_configuration_user_workflows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "log_configuration_user_workflows_user_id_module_slug_key"
  ON "log_configuration_user_workflows"("user_id", "module_slug");

CREATE INDEX "log_configuration_user_workflows_user_id_module_slug_idx"
  ON "log_configuration_user_workflows"("user_id", "module_slug");

ALTER TABLE "log_configuration_user_workflows"
  ADD CONSTRAINT "log_configuration_user_workflows_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
