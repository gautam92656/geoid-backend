import { prisma } from "../../../infrastructure/database/prisma"
import type { CoreDefectTypeDTO } from "../../../shared/constants/coreLoggingOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  code: string | null
  graphic: string | null
  defaultSampleTypeId: string | null
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toCoreDefectTypeDTO(row: {
  optionKey: string
  name: string
  code: string | null
  graphic: string | null
  defaultSampleTypeId: string | null
}): CoreDefectTypeDTO {
  return {
    id: row.optionKey,
    name: row.name,
    code: row.code ?? "",
    graphic: row.graphic,
    defaultSampleTypeId: row.defaultSampleTypeId,
  }
}

function fieldsFromDto(option: CoreDefectTypeDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    code: option.code?.trim() || null,
    graphic: option.graphic?.trim() || null,
    defaultSampleTypeId: option.defaultSampleTypeId?.trim() || null,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.coreDefectTypeTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: CoreDefectTypeDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.coreDefectTypeTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      code: fields.code,
      graphic: fields.graphic,
      defaultSampleTypeId: fields.defaultSampleTypeId,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserCoreDefectTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userCoreDefectType.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserCoreDefectTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userCoreDefectType.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserCoreDefectTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userCoreDefectType.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserCoreDefectTypesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userCoreDefectType.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      code: template.code,
      graphic: template.graphic,
      defaultSampleTypeId: template.defaultSampleTypeId,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserCoreDefectTypes(userId, logConfigurationId, slug)
}

export async function replaceUserCoreDefectTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: CoreDefectTypeDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserCoreDefectTypes(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userCoreDefectType.createMany({
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

  return listUserCoreDefectTypes(userId, logConfigurationId, slug)
}

export async function findUserCoreDefectType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userCoreDefectType.findUnique({
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

export async function createUserCoreDefectType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: CoreDefectTypeDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userCoreDefectType.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserCoreDefectType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: CoreDefectTypeDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserCoreDefectType(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_CORE_DEFECT_TYPE_NOT_FOUND")
  }

  return prisma.userCoreDefectType.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      code: fields.code,
      graphic: fields.graphic,
      defaultSampleTypeId: fields.defaultSampleTypeId,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserCoreDefectType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserCoreDefectType(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_CORE_DEFECT_TYPE_NOT_FOUND")
  }

  await prisma.userCoreDefectType.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
