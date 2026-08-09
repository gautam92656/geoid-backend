import { prisma } from "../../../infrastructure/database/prisma"
import type { LabTestPresetDTO } from "../../../shared/constants/labTestPresetOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  labTestTypeIds: string[]
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toLabTestPresetDTO(row: {
  optionKey: string
  name: string
  labTestTypeIds: string[]
}): LabTestPresetDTO {
  return {
    id: row.optionKey,
    name: row.name,
    labTestTypeIds: row.labTestTypeIds,
  }
}

function fieldsFromDto(option: LabTestPresetDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    labTestTypeIds: option.labTestTypeIds ?? [],
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.labTestPresetTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: LabTestPresetDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.labTestPresetTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      labTestTypeIds: fields.labTestTypeIds,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserLabTestPresets(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userLabTestPreset.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserLabTestPresets(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userLabTestPreset.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserLabTestPresets(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userLabTestPreset.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserLabTestPresetsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userLabTestPreset.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      labTestTypeIds: template.labTestTypeIds,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserLabTestPresets(userId, logConfigurationId, slug)
}

export async function replaceUserLabTestPresets(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: LabTestPresetDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserLabTestPresets(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userLabTestPreset.createMany({
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

  return listUserLabTestPresets(userId, logConfigurationId, slug)
}

export async function findUserLabTestPreset(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userLabTestPreset.findUnique({
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

export async function createUserLabTestPreset(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: LabTestPresetDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userLabTestPreset.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserLabTestPreset(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: LabTestPresetDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserLabTestPreset(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_LAB_TEST_PRESET_NOT_FOUND")
  }

  return prisma.userLabTestPreset.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      labTestTypeIds: fields.labTestTypeIds,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserLabTestPreset(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserLabTestPreset(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_LAB_TEST_PRESET_NOT_FOUND")
  }

  await prisma.userLabTestPreset.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
