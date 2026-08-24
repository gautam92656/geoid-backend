import { NotFoundError } from "../../../shared/errors/NotFoundError"
import {
  parseWorkflowSettings,
  type WorkflowSettings,
} from "../../../shared/constants/configModuleSettings"
import { applyLogReportFieldCodesToSteps } from "../../../shared/constants/logReportFieldCodes"
import { getLogReportCatalog } from "../log-report-template/log-report-template.catalog.service"
import { REMOVED_CONFIG_MODULE_SLUGS } from "../../../shared/constants/configModuleCatalog"
import {
  getModuleWorkflowDefaults,
  moduleHasWorkflowDefaults,
} from "../../../shared/constants/workflowDefaults"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import * as workflowRepo from "./config-module.workflow.repository"

const DEFAULT_TEMPLATE_NAME = "Default workflow"

function isValidModuleSlug(slug: string): boolean {
  const trimmed = slug.trim()
  return (
    trimmed.length > 0 &&
    !(REMOVED_CONFIG_MODULE_SLUGS as readonly string[]).includes(trimmed)
  )
}

function isEmptySteps(steps: unknown): boolean {
  return !Array.isArray(steps) || steps.length === 0
}

function isEmptyClassificationCodes(codes: unknown): boolean {
  return !Array.isArray(codes) || codes.length === 0
}

function templatePayloadFromDefaults(moduleSlug: string) {
  const defaults = getModuleWorkflowDefaults(moduleSlug)
  if (!defaults) {
    return {
      name: DEFAULT_TEMPLATE_NAME,
      enabled: true,
      applyClassificationRules: true,
      ignoreParentLegacySettings: true,
      steps: [] as unknown[],
      classificationCodes: [] as unknown[],
    }
  }

  return {
    name: defaults.name,
    enabled: defaults.enabled,
    applyClassificationRules: defaults.applyClassificationRules ?? true,
    ignoreParentLegacySettings: defaults.ignoreParentLegacySettings ?? true,
    steps: defaults.steps,
    classificationCodes: defaults.classificationCodes ?? [],
  }
}

export async function ensureWorkflowTemplate(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module workflow template not found")
  }

  const existing = await workflowRepo.findTemplateByModuleSlug(moduleSlug)
  const defaults = templatePayloadFromDefaults(moduleSlug)

  let record = existing
  if (!existing) {
    record = await workflowRepo.upsertTemplate(moduleSlug, defaults)
  } else {
    const needsSteps = isEmptySteps(existing.steps) && !isEmptySteps(defaults.steps)
    const needsCodes =
      isEmptyClassificationCodes(existing.classificationCodes) &&
      !isEmptyClassificationCodes(defaults.classificationCodes)

    if (needsSteps || needsCodes) {
      record = await workflowRepo.upsertTemplate(moduleSlug, {
        ...defaults,
        steps: needsSteps ? defaults.steps : existing.steps,
        classificationCodes: needsCodes ? defaults.classificationCodes : existing.classificationCodes,
      })
    }
  }

  if (!record) {
    throw new NotFoundError("Module workflow template not found")
  }

  const dto = await withFieldCodes(workflowRepo.toWorkflowDTO(record))
  if (JSON.stringify(workflowRepo.toWorkflowDTO(record).steps) !== JSON.stringify(dto.steps)) {
    record = await workflowRepo.upsertTemplate(moduleSlug, {
      name: dto.name,
      enabled: dto.enabled,
      applyClassificationRules: dto.applyClassificationRules,
      ignoreParentLegacySettings: dto.ignoreParentLegacySettings,
      steps: dto.steps,
      classificationCodes: dto.classificationCodes,
    })
  }

  return record
}

async function withFieldCodes(workflow: WorkflowSettings): Promise<WorkflowSettings> {
  const catalog = await getLogReportCatalog()
  const patched = applyLogReportFieldCodesToSteps(workflow.steps, catalog.fieldCodes)
  return patched.changed ? { ...workflow, steps: patched.steps } : workflow
}

export async function getWorkflowTemplate(moduleSlug: string) {
  const template = await ensureWorkflowTemplate(moduleSlug)
  return withFieldCodes(workflowRepo.toWorkflowDTO(template))
}

/** Returns the config-scoped workflow for a module. Creates a copy from the common template when missing. */
export async function ensureUserWorkflow(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module workflow not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const existing = await workflowRepo.findUserWorkflow(ownerUserId, configId, moduleSlug)
  if (existing) {
    const template = await ensureWorkflowTemplate(moduleSlug)
    const needsSteps = isEmptySteps(existing.steps) && !isEmptySteps(template.steps)
    const needsCodes =
      isEmptyClassificationCodes(existing.classificationCodes) &&
      !isEmptyClassificationCodes(template.classificationCodes)

    if (needsSteps || needsCodes) {
      return workflowRepo.updateUserWorkflow(ownerUserId, configId, moduleSlug, {
        steps: needsSteps ? template.steps : existing.steps,
        classificationCodes: needsCodes
          ? template.classificationCodes
          : existing.classificationCodes,
      })
    }

    return existing
  }

  const template = await ensureWorkflowTemplate(moduleSlug)
  return workflowRepo.createUserWorkflow(ownerUserId, configId, moduleSlug, {
    name: template.name,
    enabled: template.enabled,
    applyClassificationRules: template.applyClassificationRules,
    ignoreParentLegacySettings: template.ignoreParentLegacySettings,
    steps: template.steps,
    classificationCodes: template.classificationCodes,
  })
}

export async function getUserWorkflow(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  const record = await ensureUserWorkflow(userId, logConfigurationId, moduleSlug)
  const dto = await withFieldCodes(workflowRepo.toWorkflowDTO(record))
  if (JSON.stringify(workflowRepo.toWorkflowDTO(record).steps) !== JSON.stringify(dto.steps)) {
    const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
      userId,
      logConfigurationId
    )
    await workflowRepo.updateUserWorkflow(ownerUserId, configId, moduleSlug, {
      steps: dto.steps,
    })
  }
  return dto
}

export async function saveUserWorkflow(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  workflow: WorkflowSettings
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module workflow not found")
  }

  const parsed = await withFieldCodes(parseWorkflowSettings(workflow))
  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )
  await ensureUserWorkflow(userId, configId, moduleSlug)

  const updated = await workflowRepo.updateUserWorkflow(ownerUserId, configId, moduleSlug, {
    name: parsed.name,
    enabled: parsed.enabled,
    applyClassificationRules: parsed.applyClassificationRules ?? true,
    ignoreParentLegacySettings: parsed.ignoreParentLegacySettings,
    steps: parsed.steps,
    classificationCodes: parsed.classificationCodes ?? [],
  })

  return workflowRepo.toWorkflowDTO(updated)
}

/** Reset a config-scoped workflow to the common template defaults for this module. */
export async function resetUserWorkflow(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug) || !moduleHasWorkflowDefaults(moduleSlug)) {
    throw new NotFoundError("Module workflow not found")
  }

  const template = await ensureWorkflowTemplate(moduleSlug)
  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )
  await ensureUserWorkflow(userId, configId, moduleSlug)

  const updated = await workflowRepo.updateUserWorkflow(
    ownerUserId,
    configId,
    moduleSlug,
    {
      name: template.name,
      enabled: template.enabled,
      applyClassificationRules: template.applyClassificationRules,
      ignoreParentLegacySettings: template.ignoreParentLegacySettings,
      steps: template.steps,
      classificationCodes: template.classificationCodes,
    }
  )

  return workflowRepo.toWorkflowDTO(updated)
}
