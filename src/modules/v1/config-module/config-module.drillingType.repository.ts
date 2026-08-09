import { prisma } from "../../../infrastructure/database/prisma"
import type { DrillingTypeDTO } from "../../../shared/constants/drillingObservationsOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  tablogsAlias: string | null
  logKind: string
  graphic: string | null
  enableRecoveryField: boolean
  enableWindowedWindowless: boolean
  waterAdded: boolean
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toDrillingTypeDTO(row: {
  optionKey: string
  name: string
  tablogsAlias: string | null
  logKind: string
  graphic: string | null
  enableRecoveryField: boolean
  enableWindowedWindowless: boolean
  waterAdded: boolean
}): DrillingTypeDTO {
  return {
    id: row.optionKey,
    name: row.name,
    tablogsAlias: row.tablogsAlias,
    logKind: row.logKind === "core" ? "core" : "bore",
    graphic: row.graphic,
    enableRecoveryField: row.enableRecoveryField,
    enableWindowedWindowless: row.enableWindowedWindowless,
    waterAdded: row.waterAdded,
  }
}

function fieldsFromDto(option: DrillingTypeDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    tablogsAlias: option.tablogsAlias?.trim() || null,
    logKind: option.logKind === "core" ? "core" : "bore",
    graphic: option.graphic?.trim() || null,
    enableRecoveryField: option.enableRecoveryField ?? false,
    enableWindowedWindowless: option.enableWindowedWindowless ?? false,
    waterAdded: option.waterAdded ?? false,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.drillingTypeTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: DrillingTypeDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.drillingTypeTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      tablogsAlias: fields.tablogsAlias,
      logKind: fields.logKind,
      graphic: fields.graphic,
      enableRecoveryField: fields.enableRecoveryField,
      enableWindowedWindowless: fields.enableWindowedWindowless,
      waterAdded: fields.waterAdded,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserDrillingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userDrillingType.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserDrillingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userDrillingType.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserDrillingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userDrillingType.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserDrillingTypesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userDrillingType.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      tablogsAlias: template.tablogsAlias,
      logKind: template.logKind,
      graphic: template.graphic,
      enableRecoveryField: template.enableRecoveryField,
      enableWindowedWindowless: template.enableWindowedWindowless,
      waterAdded: template.waterAdded,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserDrillingTypes(userId, logConfigurationId, slug)
}

export async function replaceUserDrillingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DrillingTypeDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserDrillingTypes(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userDrillingType.createMany({
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

  return listUserDrillingTypes(userId, logConfigurationId, slug)
}

export async function findUserDrillingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userDrillingType.findUnique({
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

export async function createUserDrillingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DrillingTypeDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userDrillingType.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserDrillingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DrillingTypeDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserDrillingType(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_DRILLING_TYPE_NOT_FOUND")
  }

  return prisma.userDrillingType.update({
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
      logKind: fields.logKind,
      graphic: fields.graphic,
      enableRecoveryField: fields.enableRecoveryField,
      enableWindowedWindowless: fields.enableWindowedWindowless,
      waterAdded: fields.waterAdded,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserDrillingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserDrillingType(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_DRILLING_TYPE_NOT_FOUND")
  }

  await prisma.userDrillingType.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
