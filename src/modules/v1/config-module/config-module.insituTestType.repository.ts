import { prisma } from "../../../infrastructure/database/prisma"
import {
  createBlankInsituTestTypeSettings,
  parseInsituTestTypeSettings,
  type InsituTestTypeDTO,
  type InsituTestTypeSettings,
} from "../../../shared/constants/insituTestTypeTypes"
import type { Prisma } from "../../../generated/prisma/client"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  active: boolean
  graphic: string | null
  enableSegregatedGraphic: boolean
  topGraphic: string | null
  bottomGraphic: string | null
  depthFrequencyEnabled: boolean
  depthFrequency: string | null
  enableSampleLogging: boolean
  enableSubsurfaceLogging: boolean
  defaultSampleTypeId: string | null
  enableAutoSampleDescription: boolean
  settings: Prisma.JsonValue
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

function settingsToJson(
  settings: InsituTestTypeSettings | undefined
): Prisma.InputJsonValue {
  return parseInsituTestTypeSettings(settings ?? createBlankInsituTestTypeSettings()) as unknown as Prisma.InputJsonValue
}

export function toInsituTestTypeDTO(row: {
  optionKey: string
  name: string
  active: boolean
  graphic: string | null
  enableSegregatedGraphic: boolean
  topGraphic: string | null
  bottomGraphic: string | null
  depthFrequencyEnabled: boolean
  depthFrequency: string | null
  enableSampleLogging: boolean
  enableSubsurfaceLogging: boolean
  defaultSampleTypeId: string | null
  enableAutoSampleDescription: boolean
  settings?: Prisma.JsonValue | null
}): InsituTestTypeDTO {
  return {
    id: row.optionKey,
    name: row.name,
    active: row.active,
    graphic: row.graphic,
    enableSegregatedGraphic: row.enableSegregatedGraphic,
    topGraphic: row.topGraphic,
    bottomGraphic: row.bottomGraphic,
    depthFrequencyEnabled: row.depthFrequencyEnabled,
    depthFrequency: row.depthFrequency,
    enableSampleLogging: row.enableSampleLogging,
    enableSubsurfaceLogging: row.enableSubsurfaceLogging,
    defaultSampleTypeId: row.defaultSampleTypeId,
    enableAutoSampleDescription: row.enableAutoSampleDescription,
    settings: parseInsituTestTypeSettings(row.settings),
  }
}

function fieldsFromDto(option: InsituTestTypeDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    active: option.active ?? true,
    graphic: option.graphic?.trim() || null,
    enableSegregatedGraphic: option.enableSegregatedGraphic ?? false,
    topGraphic: option.topGraphic?.trim() || null,
    bottomGraphic: option.bottomGraphic?.trim() || null,
    depthFrequencyEnabled: option.depthFrequencyEnabled ?? false,
    depthFrequency: option.depthFrequency?.trim() || null,
    enableSampleLogging: option.enableSampleLogging ?? false,
    enableSubsurfaceLogging: option.enableSubsurfaceLogging ?? false,
    defaultSampleTypeId: option.defaultSampleTypeId?.trim() || null,
    enableAutoSampleDescription: option.enableAutoSampleDescription ?? false,
    settings: settingsToJson(option.settings),
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.insituTestTypeTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: InsituTestTypeDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.insituTestTypeTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      active: fields.active,
      graphic: fields.graphic,
      enableSegregatedGraphic: fields.enableSegregatedGraphic,
      topGraphic: fields.topGraphic,
      bottomGraphic: fields.bottomGraphic,
      depthFrequencyEnabled: fields.depthFrequencyEnabled,
      depthFrequency: fields.depthFrequency,
      enableSampleLogging: fields.enableSampleLogging,
      enableSubsurfaceLogging: fields.enableSubsurfaceLogging,
      defaultSampleTypeId: fields.defaultSampleTypeId,
      enableAutoSampleDescription: fields.enableAutoSampleDescription,
      settings: fields.settings,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserInsituTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userInsituTestType.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserInsituTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userInsituTestType.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserInsituTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userInsituTestType.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserInsituTestTypesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userInsituTestType.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      active: template.active,
      graphic: template.graphic,
      enableSegregatedGraphic: template.enableSegregatedGraphic,
      topGraphic: template.topGraphic,
      bottomGraphic: template.bottomGraphic,
      depthFrequencyEnabled: template.depthFrequencyEnabled,
      depthFrequency: template.depthFrequency,
      enableSampleLogging: template.enableSampleLogging,
      enableSubsurfaceLogging: template.enableSubsurfaceLogging,
      defaultSampleTypeId: template.defaultSampleTypeId,
      enableAutoSampleDescription: template.enableAutoSampleDescription,
      settings: (template.settings ?? {}) as Prisma.InputJsonValue,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserInsituTestTypes(userId, logConfigurationId, slug)
}

/** Copy template settings onto user rows that still have empty settings. */
export async function backfillEmptyUserInsituTestTypeSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  const rows = await listUserInsituTestTypes(userId, logConfigurationId, slug)
  if (rows.length === 0 || templates.length === 0) return rows

  const templateByKey = new Map(templates.map((template) => [template.optionKey, template]))

  for (const row of rows) {
    const current = parseInsituTestTypeSettings(row.settings)
    const hasCurrent =
      current.otherSettings.length > 0 ||
      (current.unitSettings?.length ?? 0) > 0 ||
      current.order != null
    if (hasCurrent) continue

    const template = templateByKey.get(row.optionKey)
    if (!template) continue
    const fromTemplate = parseInsituTestTypeSettings(template.settings)
    const hasTemplate =
      fromTemplate.otherSettings.length > 0 ||
      (fromTemplate.unitSettings?.length ?? 0) > 0 ||
      fromTemplate.order != null
    if (!hasTemplate) continue

    await prisma.userInsituTestType.update({
      where: { id: row.id },
      data: { settings: settingsToJson(fromTemplate) },
    })
  }

  return listUserInsituTestTypes(userId, logConfigurationId, slug)
}

/** Insert any default catalog types that are missing from this configuration. */
export async function syncMissingUserInsituTestTypesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  const rows = await listUserInsituTestTypes(userId, logConfigurationId, slug)
  if (templates.length === 0) return rows

  const existingKeys = new Set(rows.map((row) => row.optionKey))
  const existingNames = new Set(rows.map((row) => row.name.trim().toLowerCase()))
  const missing = templates.filter((template) => {
    if (existingKeys.has(template.optionKey)) return false
    if (existingNames.has(template.name.trim().toLowerCase())) return false
    return true
  })

  if (missing.length === 0) return rows

  const startOrder = rows.length
  await prisma.userInsituTestType.createMany({
    data: missing.map((template, index) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      active: template.active,
      graphic: template.graphic,
      enableSegregatedGraphic: template.enableSegregatedGraphic,
      topGraphic: template.topGraphic,
      bottomGraphic: template.bottomGraphic,
      depthFrequencyEnabled: template.depthFrequencyEnabled,
      depthFrequency: template.depthFrequency,
      enableSampleLogging: template.enableSampleLogging,
      enableSubsurfaceLogging: template.enableSubsurfaceLogging,
      defaultSampleTypeId: template.defaultSampleTypeId,
      enableAutoSampleDescription: template.enableAutoSampleDescription,
      settings: (template.settings ?? {}) as Prisma.InputJsonValue,
      sortOrder: startOrder + index,
    })),
  })

  return listUserInsituTestTypes(userId, logConfigurationId, slug)
}

export async function replaceUserInsituTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: InsituTestTypeDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserInsituTestTypes(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userInsituTestType.createMany({
    data: options.map((option, index) => {
      const fields = fieldsFromDto(option, index)
      return {
        userId,
        logConfigurationId,
        moduleSlug: slug,
        sourceTemplateId: null,
        ...fields,
      }
    }),
  })

  return listUserInsituTestTypes(userId, logConfigurationId, slug)
}

export async function findUserInsituTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userInsituTestType.findUnique({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
  if (!row || row.userId !== userId) return null
  return row
}

export async function createUserInsituTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: InsituTestTypeDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userInsituTestType.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserInsituTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: InsituTestTypeDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserInsituTestType(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_INSITU_TEST_TYPE_NOT_FOUND")
  }

  return prisma.userInsituTestType.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      active: fields.active,
      graphic: fields.graphic,
      enableSegregatedGraphic: fields.enableSegregatedGraphic,
      topGraphic: fields.topGraphic,
      bottomGraphic: fields.bottomGraphic,
      depthFrequencyEnabled: fields.depthFrequencyEnabled,
      depthFrequency: fields.depthFrequency,
      enableSampleLogging: fields.enableSampleLogging,
      enableSubsurfaceLogging: fields.enableSubsurfaceLogging,
      defaultSampleTypeId: fields.defaultSampleTypeId,
      enableAutoSampleDescription: fields.enableAutoSampleDescription,
      settings: fields.settings,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserInsituTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserInsituTestType(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_INSITU_TEST_TYPE_NOT_FOUND")
  }

  await prisma.userInsituTestType.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
