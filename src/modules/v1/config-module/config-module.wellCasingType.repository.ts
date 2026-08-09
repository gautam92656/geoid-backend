import { prisma } from "../../../infrastructure/database/prisma"
import type { WellCasingTypeDTO } from "../../../shared/constants/wellLogsOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  tablogsAlias: string | null
  type: string
  graphic: string | null
  allowNegativeDepth: boolean
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toWellCasingTypeDTO(row: {
  optionKey: string
  name: string
  tablogsAlias: string | null
  type: string
  graphic: string | null
  allowNegativeDepth: boolean
}): WellCasingTypeDTO {
  return {
    id: row.optionKey,
    name: row.name,
    tablogsAlias: row.tablogsAlias,
    type: row.type === "regular" ? "regular" : "surface",
    graphic: row.graphic,
    allowNegativeDepth: row.allowNegativeDepth,
  }
}

function fieldsFromDto(option: WellCasingTypeDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    tablogsAlias: option.tablogsAlias?.trim() || null,
    type: option.type === "regular" ? "regular" : "surface",
    graphic: option.graphic?.trim() || null,
    allowNegativeDepth: option.allowNegativeDepth ?? false,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.wellCasingTypeTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: WellCasingTypeDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.wellCasingTypeTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      tablogsAlias: fields.tablogsAlias,
      type: fields.type,
      graphic: fields.graphic,
      allowNegativeDepth: fields.allowNegativeDepth,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserWellCasingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userWellCasingType.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserWellCasingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userWellCasingType.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserWellCasingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userWellCasingType.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserWellCasingTypesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userWellCasingType.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      tablogsAlias: template.tablogsAlias,
      type: template.type,
      graphic: template.graphic,
      allowNegativeDepth: template.allowNegativeDepth,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserWellCasingTypes(userId, logConfigurationId, slug)
}

export async function replaceUserWellCasingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellCasingTypeDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserWellCasingTypes(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userWellCasingType.createMany({
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

  return listUserWellCasingTypes(userId, logConfigurationId, slug)
}

export async function findUserWellCasingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userWellCasingType.findUnique({
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

export async function createUserWellCasingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellCasingTypeDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userWellCasingType.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserWellCasingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellCasingTypeDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserWellCasingType(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_WELLCASINGTYPE_NOT_FOUND")
  }

  return prisma.userWellCasingType.update({
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
      type: fields.type,
      graphic: fields.graphic,
      allowNegativeDepth: fields.allowNegativeDepth,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserWellCasingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserWellCasingType(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_WELLCASINGTYPE_NOT_FOUND")
  }

  await prisma.userWellCasingType.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
