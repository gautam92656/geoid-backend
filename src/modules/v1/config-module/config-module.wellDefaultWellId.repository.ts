import { prisma } from "../../../infrastructure/database/prisma"
import type { WellDefaultWellIdDTO } from "../../../shared/constants/wellLogsOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toWellDefaultWellIdDTO(row: {
  optionKey: string
  name: string

}): WellDefaultWellIdDTO {
  return {
    id: row.optionKey,
    name: row.name,
  }
}

function fieldsFromDto(option: WellDefaultWellIdDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.wellDefaultWellIdTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: WellDefaultWellIdDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.wellDefaultWellIdTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,

      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserWellDefaultWellIds(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userWellDefaultWellId.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserWellDefaultWellIds(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userWellDefaultWellId.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserWellDefaultWellIds(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userWellDefaultWellId.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserWellDefaultWellIdsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userWellDefaultWellId.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,

      sortOrder: template.sortOrder,
    })),
  })

  return listUserWellDefaultWellIds(userId, logConfigurationId, slug)
}

export async function replaceUserWellDefaultWellIds(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellDefaultWellIdDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserWellDefaultWellIds(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userWellDefaultWellId.createMany({
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

  return listUserWellDefaultWellIds(userId, logConfigurationId, slug)
}

export async function findUserWellDefaultWellId(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userWellDefaultWellId.findUnique({
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

export async function createUserWellDefaultWellId(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellDefaultWellIdDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userWellDefaultWellId.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserWellDefaultWellId(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellDefaultWellIdDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserWellDefaultWellId(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_WELLDEFAULTWELLID_NOT_FOUND")
  }

  return prisma.userWellDefaultWellId.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,

      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserWellDefaultWellId(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserWellDefaultWellId(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_WELLDEFAULTWELLID_NOT_FOUND")
  }

  await prisma.userWellDefaultWellId.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
