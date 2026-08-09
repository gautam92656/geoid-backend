import { prisma } from "../../../infrastructure/database/prisma"
import { Prisma } from "../../../generated/prisma/client"
import type {
  LabTestResultFieldDTO,
  LabTestTypeDTO,
} from "../../../shared/constants/labTestsOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  graphic: string | null
  externalAlias: string | null
  aliasTable: string | null
  addAsSelectedDataPlot: boolean
  active: boolean
  labTestResultFields: unknown
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toLabTestTypeDTO(row: {
  optionKey: string
  name: string
  graphic: string | null
  externalAlias: string | null
  aliasTable: string | null
  addAsSelectedDataPlot: boolean
  active: boolean
  labTestResultFields: unknown
}): LabTestTypeDTO {
  return {
    id: row.optionKey,
    name: row.name,
    graphic: row.graphic,
    externalAlias: row.externalAlias,
    aliasTable: row.aliasTable,
    addAsSelectedDataPlot: row.addAsSelectedDataPlot,
    active: row.active,
    labTestResultFields: Array.isArray(row.labTestResultFields)
      ? (row.labTestResultFields as LabTestResultFieldDTO[])
      : [],
  }
}

function fieldsFromDto(option: LabTestTypeDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    graphic: option.graphic?.trim() || null,
    externalAlias: option.externalAlias?.trim() || null,
    aliasTable: option.aliasTable?.trim() || null,
    addAsSelectedDataPlot: option.addAsSelectedDataPlot ?? false,
    active: option.active !== false,
    labTestResultFields: (option.labTestResultFields ?? []) as Prisma.InputJsonValue,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.labTestTypeTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: LabTestTypeDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.labTestTypeTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      graphic: fields.graphic,
      externalAlias: fields.externalAlias,
      aliasTable: fields.aliasTable,
      addAsSelectedDataPlot: fields.addAsSelectedDataPlot,
      active: fields.active,
      labTestResultFields: fields.labTestResultFields,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserLabTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userLabTestType.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserLabTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userLabTestType.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserLabTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userLabTestType.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserLabTestTypesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userLabTestType.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      graphic: template.graphic,
      externalAlias: template.externalAlias,
      aliasTable: template.aliasTable,
      addAsSelectedDataPlot: template.addAsSelectedDataPlot,
      active: template.active,
      labTestResultFields: template.labTestResultFields as Prisma.InputJsonValue,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserLabTestTypes(userId, logConfigurationId, slug)
}

export async function replaceUserLabTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: LabTestTypeDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserLabTestTypes(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userLabTestType.createMany({
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

  return listUserLabTestTypes(userId, logConfigurationId, slug)
}

export async function findUserLabTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userLabTestType.findUnique({
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

export async function createUserLabTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: LabTestTypeDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userLabTestType.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserLabTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: LabTestTypeDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserLabTestType(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_LAB_TEST_TYPE_NOT_FOUND")
  }

  return prisma.userLabTestType.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      graphic: fields.graphic,
      externalAlias: fields.externalAlias,
      aliasTable: fields.aliasTable,
      addAsSelectedDataPlot: fields.addAsSelectedDataPlot,
      active: fields.active,
      labTestResultFields: fields.labTestResultFields,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserLabTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserLabTestType(userId, logConfigurationId, moduleSlug, optionKey)
  if (!existing) {
    throw new Error("USER_LAB_TEST_TYPE_NOT_FOUND")
  }

  await prisma.userLabTestType.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
