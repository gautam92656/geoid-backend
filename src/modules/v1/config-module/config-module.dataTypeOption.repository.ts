import { prisma } from "../../../infrastructure/database/prisma"
import type { DataTypeOptionDTO } from "../../../shared/constants/dataTypeOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  dataTypeId: string
  optionKey: string
  name: string
  code: string | null
  graphic: string | null
  rockGroup: string | null
  showAutoScale: boolean
  color: string | null
  overlayColor: string | null
  textColor: string | null
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toDataTypeOptionDTO(row: {
  optionKey: string
  name: string
  code: string | null
  graphic: string | null
  rockGroup: string | null
  showAutoScale?: boolean
  color?: string | null
  overlayColor?: string | null
  textColor?: string | null
}): DataTypeOptionDTO {
  return {
    id: row.optionKey,
    name: row.name,
    code: row.code,
    abbreviation: row.code,
    graphic: row.graphic,
    rockGroup: row.rockGroup,
    showAutoScale: row.showAutoScale ?? true,
    color: row.color ?? null,
    overlayColor: row.overlayColor ?? null,
    textColor: row.textColor ?? null,
  }
}

function fieldsFromDto(option: DataTypeOptionDTO, sortOrder: number) {
  const code = option.code?.trim() || option.abbreviation?.trim() || null
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    code,
    graphic: option.graphic?.trim() || null,
    rockGroup: option.rockGroup?.trim() || null,
    showAutoScale: option.showAutoScale ?? true,
    color: option.color?.trim() || null,
    overlayColor: option.overlayColor?.trim() || null,
    textColor: option.textColor?.trim() || null,
    sortOrder,
  }
}

export async function listTemplates(
  moduleSlug: string,
  dataTypeId: string
): Promise<TemplateRow[]> {
  return prisma.dataTypeOptionTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim(), dataTypeId: dataTypeId.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  dataTypeId: string,
  option: DataTypeOptionDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const typeId = dataTypeId.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.dataTypeOptionTemplate.upsert({
    where: {
      moduleSlug_dataTypeId_optionKey: {
        moduleSlug: slug,
        dataTypeId: typeId,
        optionKey: fields.optionKey,
      },
    },
    update: {
      name: fields.name,
      code: fields.code,
      graphic: fields.graphic,
      rockGroup: fields.rockGroup,
      showAutoScale: fields.showAutoScale,
      color: fields.color,
      overlayColor: fields.overlayColor,
      textColor: fields.textColor,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      dataTypeId: typeId,
      ...fields,
    },
  })
}

export async function countUserOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string
): Promise<number> {
  return prisma.userDataTypeOption.count({
    where: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      dataTypeId: dataTypeId.trim(),
    },
  })
}

export async function listUserOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string
): Promise<UserRow[]> {
  return prisma.userDataTypeOption.findMany({
    where: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      dataTypeId: dataTypeId.trim(),
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string
): Promise<void> {
  await prisma.userDataTypeOption.deleteMany({
    where: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      dataTypeId: dataTypeId.trim(),
    },
  })
}

export async function createUserOptionsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  const typeId = dataTypeId.trim()
  if (templates.length === 0) return []

  await prisma.userDataTypeOption.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      dataTypeId: typeId,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      code: template.code,
      graphic: template.graphic,
      rockGroup: template.rockGroup,
      showAutoScale: template.showAutoScale,
      color: template.color,
      overlayColor: template.overlayColor,
      textColor: template.textColor,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserOptions(userId, logConfigurationId, slug, typeId)
}

export async function replaceUserOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  options: DataTypeOptionDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  const typeId = dataTypeId.trim()
  await deleteUserOptions(userId, logConfigurationId, slug, typeId)

  if (options.length === 0) return []

  await prisma.userDataTypeOption.createMany({
    data: options.map((option, index) => {
      const fields = fieldsFromDto(option, index)
      return {
        userId,
        logConfigurationId,
        moduleSlug: slug,
        dataTypeId: typeId,
        sourceTemplateId: null,
        ...fields,
      }
    }),
  })

  return listUserOptions(userId, logConfigurationId, slug, typeId)
}

export async function findUserOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userDataTypeOption.findUnique({
    where: {
      logConfigurationId_moduleSlug_dataTypeId_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        dataTypeId: dataTypeId.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
  if (!row || row.userId !== userId) return null
  return row
}

export async function createUserOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  option: DataTypeOptionDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userDataTypeOption.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      dataTypeId: dataTypeId.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  optionKey: string,
  option: DataTypeOptionDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserOption(
    userId,
    logConfigurationId,
    moduleSlug,
    dataTypeId,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_DATA_TYPE_OPTION_NOT_FOUND")
  }

  return prisma.userDataTypeOption.update({
    where: {
      logConfigurationId_moduleSlug_dataTypeId_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        dataTypeId: dataTypeId.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      code: fields.code,
      graphic: fields.graphic,
      rockGroup: fields.rockGroup,
      showAutoScale: fields.showAutoScale,
      color: fields.color,
      overlayColor: fields.overlayColor,
      textColor: fields.textColor,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
    },
  })
}

export async function deleteUserOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserOption(
    userId,
    logConfigurationId,
    moduleSlug,
    dataTypeId,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_DATA_TYPE_OPTION_NOT_FOUND")
  }

  await prisma.userDataTypeOption.delete({
    where: {
      logConfigurationId_moduleSlug_dataTypeId_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        dataTypeId: dataTypeId.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
