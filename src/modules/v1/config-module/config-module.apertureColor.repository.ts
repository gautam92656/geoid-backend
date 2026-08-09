import { prisma } from "../../../infrastructure/database/prisma"
import type { ApertureColorDTO } from "../../../shared/constants/coreLoggingOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  color: string | null
  textColor: string | null
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toApertureColorDTO(row: {
  optionKey: string
  name: string
  color: string | null
  textColor: string | null
}): ApertureColorDTO {
  return {
    id: row.optionKey,
    name: row.name,
    color: row.color,
    textColor: row.textColor,
  }
}

function fieldsFromDto(option: ApertureColorDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    color: option.color?.trim() || null,
    textColor: option.textColor?.trim() || null,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.apertureColorTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: ApertureColorDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.apertureColorTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      color: fields.color,
      textColor: fields.textColor,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserApertureColors(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userApertureColor.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserApertureColors(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userApertureColor.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserApertureColors(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userApertureColor.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserApertureColorsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userApertureColor.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      color: template.color,
      textColor: template.textColor,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserApertureColors(userId, logConfigurationId, slug)
}

export async function replaceUserApertureColors(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: ApertureColorDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserApertureColors(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userApertureColor.createMany({
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

  return listUserApertureColors(userId, logConfigurationId, slug)
}

export async function findUserApertureColor(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userApertureColor.findUnique({
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

export async function createUserApertureColor(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: ApertureColorDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userApertureColor.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserApertureColor(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: ApertureColorDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserApertureColor(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_APERTURE_COLOR_NOT_FOUND")
  }

  return prisma.userApertureColor.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      color: fields.color,
      textColor: fields.textColor,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserApertureColor(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserApertureColor(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_APERTURE_COLOR_NOT_FOUND")
  }

  await prisma.userApertureColor.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
