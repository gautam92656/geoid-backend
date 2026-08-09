import { prisma } from "../../../infrastructure/database/prisma"
import type { SampleTypeDTO } from "../../../shared/constants/samplesOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  tablogsAlias: string | null
  graphic: string | null
  sampleAbbreviation: string | null
  noteRecovery: boolean
  displayQcId: boolean
  enableSegregatedGraphic: boolean
  topGraphic: string | null
  bottomGraphic: string | null
  enableSubsurfaceLogging: boolean
  enableAssignLabTest: boolean
  enableInsituTestLogging: boolean
  defaultInsituTestTypeId: string | null
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toSampleTypeDTO(row: {
  optionKey: string
  name: string
  tablogsAlias: string | null
  graphic: string | null
  sampleAbbreviation: string | null
  noteRecovery: boolean
  displayQcId: boolean
  enableSegregatedGraphic: boolean
  topGraphic: string | null
  bottomGraphic: string | null
  enableSubsurfaceLogging: boolean
  enableAssignLabTest: boolean
  enableInsituTestLogging: boolean
  defaultInsituTestTypeId: string | null
}): SampleTypeDTO {
  return {
    id: row.optionKey,
    name: row.name,
    tablogsAlias: row.tablogsAlias,
    graphic: row.graphic,
    sampleAbbreviation: row.sampleAbbreviation,
    noteRecovery: row.noteRecovery,
    displayQcId: row.displayQcId,
    enableSegregatedGraphic: row.enableSegregatedGraphic,
    topGraphic: row.topGraphic,
    bottomGraphic: row.bottomGraphic,
    enableSubsurfaceLogging: row.enableSubsurfaceLogging,
    enableAssignLabTest: row.enableAssignLabTest,
    enableInsituTestLogging: row.enableInsituTestLogging,
    defaultInsituTestTypeId: row.defaultInsituTestTypeId,
  }
}

function fieldsFromDto(option: SampleTypeDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    tablogsAlias: option.tablogsAlias?.trim() || null,
    graphic: option.graphic?.trim() || null,
    sampleAbbreviation: option.sampleAbbreviation?.trim() || null,
    noteRecovery: option.noteRecovery ?? false,
    displayQcId: option.displayQcId ?? false,
    enableSegregatedGraphic: option.enableSegregatedGraphic ?? false,
    topGraphic: option.topGraphic?.trim() || null,
    bottomGraphic: option.bottomGraphic?.trim() || null,
    enableSubsurfaceLogging: option.enableSubsurfaceLogging ?? false,
    enableAssignLabTest: option.enableAssignLabTest ?? false,
    enableInsituTestLogging: option.enableInsituTestLogging ?? false,
    defaultInsituTestTypeId: option.defaultInsituTestTypeId?.trim() || null,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.sampleTypeTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: SampleTypeDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.sampleTypeTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      tablogsAlias: fields.tablogsAlias,
      graphic: fields.graphic,
      sampleAbbreviation: fields.sampleAbbreviation,
      noteRecovery: fields.noteRecovery,
      displayQcId: fields.displayQcId,
      enableSegregatedGraphic: fields.enableSegregatedGraphic,
      topGraphic: fields.topGraphic,
      bottomGraphic: fields.bottomGraphic,
      enableSubsurfaceLogging: fields.enableSubsurfaceLogging,
      enableAssignLabTest: fields.enableAssignLabTest,
      enableInsituTestLogging: fields.enableInsituTestLogging,
      defaultInsituTestTypeId: fields.defaultInsituTestTypeId,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserSampleTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userSampleType.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserSampleTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userSampleType.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserSampleTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userSampleType.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserSampleTypesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userSampleType.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      tablogsAlias: template.tablogsAlias,
      graphic: template.graphic,
      sampleAbbreviation: template.sampleAbbreviation,
      noteRecovery: template.noteRecovery,
      displayQcId: template.displayQcId,
      enableSegregatedGraphic: template.enableSegregatedGraphic,
      topGraphic: template.topGraphic,
      bottomGraphic: template.bottomGraphic,
      enableSubsurfaceLogging: template.enableSubsurfaceLogging,
      enableAssignLabTest: template.enableAssignLabTest,
      enableInsituTestLogging: template.enableInsituTestLogging,
      defaultInsituTestTypeId: template.defaultInsituTestTypeId,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserSampleTypes(userId, logConfigurationId, slug)
}

export async function replaceUserSampleTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: SampleTypeDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserSampleTypes(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userSampleType.createMany({
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

  return listUserSampleTypes(userId, logConfigurationId, slug)
}

export async function findUserSampleType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userSampleType.findUnique({
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

export async function createUserSampleType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: SampleTypeDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userSampleType.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserSampleType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: SampleTypeDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserSampleType(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_SAMPLE_TYPE_NOT_FOUND")
  }

  return prisma.userSampleType.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      tablogsAlias: fields.tablogsAlias,
      graphic: fields.graphic,
      sampleAbbreviation: fields.sampleAbbreviation,
      noteRecovery: fields.noteRecovery,
      displayQcId: fields.displayQcId,
      enableSegregatedGraphic: fields.enableSegregatedGraphic,
      topGraphic: fields.topGraphic,
      bottomGraphic: fields.bottomGraphic,
      enableSubsurfaceLogging: fields.enableSubsurfaceLogging,
      enableAssignLabTest: fields.enableAssignLabTest,
      enableInsituTestLogging: fields.enableInsituTestLogging,
      defaultInsituTestTypeId: fields.defaultInsituTestTypeId,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserSampleType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserSampleType(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_SAMPLE_TYPE_NOT_FOUND")
  }

  await prisma.userSampleType.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
