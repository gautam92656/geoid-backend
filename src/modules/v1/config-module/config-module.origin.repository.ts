import { prisma } from "../../../infrastructure/database/prisma"
import type { OriginOptionDTO } from "../../../shared/constants/originOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  nameInDescription: string | null
  codeInDescription: string | null
  classificationCodeOverride: boolean
  type: string
  color: string | null
  applyColorToPdf: boolean
  overrideGraphic: boolean
  splitGraphic: boolean
  graphic: string | null
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toOriginOptionDTO(row: {
  optionKey: string
  name: string
  nameInDescription: string | null
  codeInDescription: string | null
  classificationCodeOverride: boolean
  type: string
  color: string | null
  applyColorToPdf: boolean
  overrideGraphic: boolean
  splitGraphic: boolean
  graphic: string | null
}): OriginOptionDTO {
  return {
    id: row.optionKey,
    name: row.name,
    nameInDescription: row.nameInDescription ?? row.name,
    codeInDescription: row.codeInDescription,
    classificationCodeOverride: row.classificationCodeOverride,
    type: row.type,
    color: row.color,
    applyColorToPdf: row.applyColorToPdf,
    overrideGraphic: row.overrideGraphic,
    splitGraphic: row.splitGraphic,
    graphic: row.graphic,
  }
}

function fieldsFromDto(option: OriginOptionDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    nameInDescription: (option.nameInDescription ?? option.name).trim() || option.name.trim(),
    codeInDescription: option.codeInDescription?.trim() || null,
    classificationCodeOverride: option.classificationCodeOverride ?? false,
    type: (option.type?.trim() || "Soil").slice(0, 50),
    color: option.color?.trim() || null,
    applyColorToPdf: option.applyColorToPdf ?? false,
    overrideGraphic: option.overrideGraphic ?? false,
    splitGraphic: option.splitGraphic ?? false,
    graphic: option.graphic?.trim() || null,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.originOptionTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: OriginOptionDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.originOptionTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      nameInDescription: fields.nameInDescription,
      codeInDescription: fields.codeInDescription,
      classificationCodeOverride: fields.classificationCodeOverride,
      type: fields.type,
      color: fields.color,
      applyColorToPdf: fields.applyColorToPdf,
      overrideGraphic: fields.overrideGraphic,
      splitGraphic: fields.splitGraphic,
      graphic: fields.graphic,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserOrigins(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userOriginOption.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserOrigins(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userOriginOption.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserOrigins(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userOriginOption.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserOriginsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userOriginOption.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      nameInDescription: template.nameInDescription,
      codeInDescription: template.codeInDescription,
      classificationCodeOverride: template.classificationCodeOverride,
      type: template.type,
      color: template.color,
      applyColorToPdf: template.applyColorToPdf,
      overrideGraphic: template.overrideGraphic,
      splitGraphic: template.splitGraphic,
      graphic: template.graphic,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserOrigins(userId, logConfigurationId, slug)
}

export async function replaceUserOrigins(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: OriginOptionDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserOrigins(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userOriginOption.createMany({
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

  return listUserOrigins(userId, logConfigurationId, slug)
}

export async function findUserOrigin(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userOriginOption.findUnique({
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

export async function createUserOrigin(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: OriginOptionDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userOriginOption.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserOrigin(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: OriginOptionDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserOrigin(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_ORIGIN_NOT_FOUND")
  }

  return prisma.userOriginOption.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      nameInDescription: fields.nameInDescription,
      codeInDescription: fields.codeInDescription,
      classificationCodeOverride: fields.classificationCodeOverride,
      type: fields.type,
      color: fields.color,
      applyColorToPdf: fields.applyColorToPdf,
      overrideGraphic: fields.overrideGraphic,
      splitGraphic: fields.splitGraphic,
      graphic: fields.graphic,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      // Allow renaming the stable key when the client sends a new id.
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserOrigin(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserOrigin(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_ORIGIN_NOT_FOUND")
  }

  await prisma.userOriginOption.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
