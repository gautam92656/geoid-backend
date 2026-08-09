import { prisma } from "../../../infrastructure/database/prisma"
import { Prisma } from "../../../generated/prisma/client"
import {
  parseWorkflowSettings,
  type WorkflowSettings,
} from "../../../shared/constants/configModuleSettings"

export type WorkflowRecord = {
  id: number
  moduleSlug: string
  name: string
  enabled: boolean
  applyClassificationRules: boolean
  ignoreParentLegacySettings: boolean
  steps: unknown
  classificationCodes: unknown
  createdAt: Date
  updatedAt: Date
}

export type UserWorkflowRecord = WorkflowRecord & {
  userId: number
  logConfigurationId: number
}

function mapTemplate(row: {
  id: number
  moduleSlug: string
  name: string
  enabled: boolean
  applyClassificationRules: boolean
  ignoreParentLegacySettings: boolean
  steps: unknown
  classificationCodes: unknown
  createdAt: Date
  updatedAt: Date
}): WorkflowRecord {
  return {
    id: row.id,
    moduleSlug: row.moduleSlug,
    name: row.name,
    enabled: row.enabled,
    applyClassificationRules: row.applyClassificationRules,
    ignoreParentLegacySettings: row.ignoreParentLegacySettings,
    steps: row.steps,
    classificationCodes: row.classificationCodes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapUser(row: {
  id: number
  userId: number
  logConfigurationId: number
  moduleSlug: string
  name: string
  enabled: boolean
  applyClassificationRules: boolean
  ignoreParentLegacySettings: boolean
  steps: unknown
  classificationCodes: unknown
  createdAt: Date
  updatedAt: Date
}): UserWorkflowRecord {
  return {
    ...mapTemplate(row),
    userId: row.userId,
    logConfigurationId: row.logConfigurationId,
  }
}

export function toWorkflowDTO(record: WorkflowRecord): WorkflowSettings {
  return parseWorkflowSettings({
    enabled: record.enabled,
    name: record.name,
    ignoreParentLegacySettings: record.ignoreParentLegacySettings,
    applyClassificationRules: record.applyClassificationRules,
    steps: record.steps,
    classificationCodes: record.classificationCodes,
  })
}

export async function findTemplateByModuleSlug(moduleSlug: string) {
  const row = await prisma.workflowTemplate.findUnique({
    where: { moduleSlug: moduleSlug.trim() },
  })
  return row ? mapTemplate(row) : null
}

export async function upsertTemplate(
  moduleSlug: string,
  data: {
    name: string
    enabled?: boolean
    applyClassificationRules?: boolean
    ignoreParentLegacySettings?: boolean
    steps?: unknown
    classificationCodes?: unknown
  }
) {
  const slug = moduleSlug.trim()
  const row = await prisma.workflowTemplate.upsert({
    where: { moduleSlug: slug },
    update: {
      name: data.name.trim(),
      enabled: data.enabled ?? true,
      applyClassificationRules: data.applyClassificationRules ?? true,
      ignoreParentLegacySettings: data.ignoreParentLegacySettings ?? true,
      ...(data.steps !== undefined
        ? { steps: data.steps as Prisma.InputJsonValue }
        : {}),
      ...(data.classificationCodes !== undefined
        ? { classificationCodes: data.classificationCodes as Prisma.InputJsonValue }
        : {}),
    },
    create: {
      moduleSlug: slug,
      name: data.name.trim(),
      enabled: data.enabled ?? true,
      applyClassificationRules: data.applyClassificationRules ?? true,
      ignoreParentLegacySettings: data.ignoreParentLegacySettings ?? true,
      steps: (data.steps ?? []) as Prisma.InputJsonValue,
      classificationCodes: (data.classificationCodes ?? []) as Prisma.InputJsonValue,
    },
  })
  return mapTemplate(row)
}

export async function findUserWorkflow(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  const row = await prisma.userWorkflow.findUnique({
    where: {
      logConfigurationId_moduleSlug: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
      },
    },
  })
  if (!row || row.userId !== userId) return null
  return mapUser(row)
}

export async function createUserWorkflow(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  data: {
    name: string
    enabled?: boolean
    applyClassificationRules?: boolean
    ignoreParentLegacySettings?: boolean
    steps?: unknown
    classificationCodes?: unknown
  }
) {
  const row = await prisma.userWorkflow.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      name: data.name.trim(),
      enabled: data.enabled ?? true,
      applyClassificationRules: data.applyClassificationRules ?? true,
      ignoreParentLegacySettings: data.ignoreParentLegacySettings ?? true,
      steps: (data.steps ?? []) as Prisma.InputJsonValue,
      classificationCodes: (data.classificationCodes ?? []) as Prisma.InputJsonValue,
    },
  })
  return mapUser(row)
}

export async function updateUserWorkflow(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  data: {
    name?: string
    enabled?: boolean
    applyClassificationRules?: boolean
    ignoreParentLegacySettings?: boolean
    steps?: unknown
    classificationCodes?: unknown
  }
) {
  const payload: Prisma.UserWorkflowUpdateInput = {}
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.enabled !== undefined) payload.enabled = data.enabled
  if (data.applyClassificationRules !== undefined) {
    payload.applyClassificationRules = data.applyClassificationRules
  }
  if (data.ignoreParentLegacySettings !== undefined) {
    payload.ignoreParentLegacySettings = data.ignoreParentLegacySettings
  }
  if (data.steps !== undefined) payload.steps = data.steps as Prisma.InputJsonValue
  if (data.classificationCodes !== undefined) {
    payload.classificationCodes = data.classificationCodes as Prisma.InputJsonValue
  }

  const existing = await findUserWorkflow(userId, logConfigurationId, moduleSlug)
  if (!existing) {
    throw new Error("USER_WORKFLOW_NOT_FOUND")
  }

  const row = await prisma.userWorkflow.update({
    where: {
      logConfigurationId_moduleSlug: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
      },
    },
    data: payload,
  })
  return mapUser(row)
}
