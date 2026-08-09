import type { LogReportTemplateLogType, Prisma } from "../../../generated/prisma/client"
import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import {
  createDefaultConfig,
  isEmptyConfig,
  readBuilderConfigurationCatalog,
} from "./log-report-template.defaults"
import { toGroupedList, toLogReportTemplateDTO } from "./log-report-template.mapper"
import * as repo from "./log-report-template.repository"

const DEFAULT_SEED = [
  { name: "Marsh Template Gen 2", logType: "borelog" as const, isDefault: true },
  { name: "Corelog Default", logType: "corelog" as const, isDefault: true },
]

async function ensureSeedTemplates(userId: number) {
  const count = await repo.countForUser(userId)
  if (count > 0) return

  for (const [index, seed] of DEFAULT_SEED.entries()) {
    await repo.create({
      userId,
      name: seed.name,
      logType: seed.logType,
      isDefault: seed.isDefault,
      config: createDefaultConfig(seed.logType),
      logConfigurationIds: [],
      sortOrder: index,
      templateVersion: 2,
    })
  }
}

export async function listGrouped(userId: number) {
  await ensureSeedTemplates(userId)
  const templates = await repo.findAllForUser(userId)
  return toGroupedList(templates)
}

export async function list(filters: repo.LogReportTemplateListFilters) {
  await ensureSeedTemplates(filters.userId)
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toLogReportTemplateDTO) }
}

export async function getOne(userId: number, id: number) {
  const template = await repo.findByIdForUser(id, userId)
  if (!template || template.deletedAt) {
    throw new NotFoundError("Log report template not found")
  }
  return toLogReportTemplateDTO(template)
}

export async function getBuilderConfiguration() {
  return {
    data: readBuilderConfigurationCatalog(),
  }
}

export async function create(
  userId: number,
  input: {
    name: string
    logType: LogReportTemplateLogType
    isDefault?: boolean
    config?: Prisma.InputJsonValue
    logConfigurationIds?: Prisma.InputJsonValue
    templateVersion?: number
  }
) {
  const duplicate = await repo.findByNameLogTypeForUser(userId, input.name, input.logType)
  if (duplicate) {
    throw new ConflictError("A template with this name already exists for this log type.")
  }

  const config = isEmptyConfig(input.config)
    ? createDefaultConfig(input.logType)
    : (input.config as Prisma.InputJsonValue)

  if (input.isDefault) {
    await repo.clearDefaultForLogType(userId, input.logType)
  }

  const existing = await repo.findAllForUser(userId)
  const template = await repo.create({
    userId,
    name: input.name,
    logType: input.logType,
    isDefault: Boolean(input.isDefault),
    config,
    logConfigurationIds: input.logConfigurationIds ?? [],
    templateVersion: input.templateVersion ?? 2,
    sortOrder: existing.length,
  })

  return toLogReportTemplateDTO(template)
}

export async function update(
  userId: number,
  id: number,
  input: repo.UpdateLogReportTemplateInput
) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Log report template not found")
  }

  const nextLogType = input.logType ?? existing.logType
  const nextName = input.name ?? existing.name

  if (input.name !== undefined || input.logType !== undefined) {
    const duplicate = await repo.findByNameLogTypeForUser(userId, nextName, nextLogType, id)
    if (duplicate) {
      throw new ConflictError("A template with this name already exists for this log type.")
    }
  }

  if (input.isDefault === true) {
    await repo.clearDefaultForLogType(userId, nextLogType, id)
  }

  const updated = await repo.update(id, userId, input)
  return toLogReportTemplateDTO(updated)
}

export async function remove(userId: number, id: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Log report template not found")
  }
  await repo.softDelete(id, userId)
  return { message: "Log report template removed" }
}

export async function reorder(userId: number, orderedIds: number[]) {
  const owned = await repo.findAllForUser(userId)
  const ownedIds = new Set(owned.map((template) => template.id))
  const filtered = orderedIds.filter((id) => ownedIds.has(id))
  await repo.reorder(userId, filtered)
  const templates = await repo.findAllForUser(userId)
  return toGroupedList(templates)
}
