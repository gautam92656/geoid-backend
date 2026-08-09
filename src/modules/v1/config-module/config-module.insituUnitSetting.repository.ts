import { prisma } from "../../../infrastructure/database/prisma"
import type { InsituUnitSettingDTO } from "../../../shared/constants/insituTestTypeTypes"

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

export function toInsituUnitSettingDTO(row: {
  optionKey: string
  name: string
}): InsituUnitSettingDTO {
  return {
    id: row.optionKey,
    name: row.name,
  }
}

function fieldsFromDto(option: InsituUnitSettingDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.insituUnitSettingTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: InsituUnitSettingDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.insituUnitSettingTemplate.upsert({
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

export async function countUserInsituUnitSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userInsituUnitSetting.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserInsituUnitSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userInsituUnitSetting.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserInsituUnitSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userInsituUnitSetting.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserInsituUnitSettingsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userInsituUnitSetting.createMany({
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

  return listUserInsituUnitSettings(userId, logConfigurationId, slug)
}

export async function replaceUserInsituUnitSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: InsituUnitSettingDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserInsituUnitSettings(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userInsituUnitSetting.createMany({
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

  return listUserInsituUnitSettings(userId, logConfigurationId, slug)
}

export async function findUserInsituUnitSetting(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userInsituUnitSetting.findUnique({
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

export async function createUserInsituUnitSetting(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: InsituUnitSettingDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userInsituUnitSetting.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserInsituUnitSetting(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: InsituUnitSettingDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserInsituUnitSetting(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_INSITU_UNIT_SETTING_NOT_FOUND")
  }

  return prisma.userInsituUnitSetting.update({
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

export async function deleteUserInsituUnitSetting(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserInsituUnitSetting(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_INSITU_UNIT_SETTING_NOT_FOUND")
  }

  await prisma.userInsituUnitSetting.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
