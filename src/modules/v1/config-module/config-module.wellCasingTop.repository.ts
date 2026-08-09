import { prisma } from "../../../infrastructure/database/prisma"
import type { WellCasingTopDTO } from "../../../shared/constants/wellLogsOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  tablogsAlias: string | null
  graphic: string | null
  allowNegativeDepth: boolean
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toWellCasingTopDTO(row: {
  optionKey: string
  name: string
  tablogsAlias: string | null
  graphic: string | null
  allowNegativeDepth: boolean
}): WellCasingTopDTO {
  return {
    id: row.optionKey,
    name: row.name,
    tablogsAlias: row.tablogsAlias,
    graphic: row.graphic,
    allowNegativeDepth: row.allowNegativeDepth,
  }
}

function fieldsFromDto(option: WellCasingTopDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    tablogsAlias: option.tablogsAlias?.trim() || null,
    graphic: option.graphic?.trim() || null,
    allowNegativeDepth: option.allowNegativeDepth ?? true,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.wellCasingTopTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: WellCasingTopDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.wellCasingTopTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      tablogsAlias: fields.tablogsAlias,
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

export async function countUserWellCasingTops(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userWellCasingTop.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserWellCasingTops(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userWellCasingTop.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserWellCasingTops(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userWellCasingTop.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserWellCasingTopsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userWellCasingTop.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      tablogsAlias: template.tablogsAlias,
      graphic: template.graphic,
      allowNegativeDepth: template.allowNegativeDepth,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserWellCasingTops(userId, logConfigurationId, slug)
}

export async function replaceUserWellCasingTops(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellCasingTopDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserWellCasingTops(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userWellCasingTop.createMany({
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

  return listUserWellCasingTops(userId, logConfigurationId, slug)
}

export async function findUserWellCasingTop(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userWellCasingTop.findUnique({
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

export async function createUserWellCasingTop(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellCasingTopDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userWellCasingTop.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserWellCasingTop(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellCasingTopDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserWellCasingTop(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_WELLCASINGTOP_NOT_FOUND")
  }

  return prisma.userWellCasingTop.update({
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
      allowNegativeDepth: fields.allowNegativeDepth,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserWellCasingTop(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserWellCasingTop(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_WELLCASINGTOP_NOT_FOUND")
  }

  await prisma.userWellCasingTop.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
