import { prisma } from "../../../infrastructure/database/prisma"
import type { DrillingObservationDTO } from "../../../shared/constants/drillingObservationsOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  tablogsAlias: string | null
  graphic: string | null
  depthRequired: boolean
  observationDateTimeRequired: boolean
  isDepthOfCasing: boolean
  isDepthToWater: boolean
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toDrillingObservationDTO(row: {
  optionKey: string
  name: string
  tablogsAlias: string | null
  graphic: string | null
  depthRequired: boolean
  observationDateTimeRequired: boolean
  isDepthOfCasing: boolean
  isDepthToWater: boolean
}): DrillingObservationDTO {
  return {
    id: row.optionKey,
    name: row.name,
    tablogsAlias: row.tablogsAlias,
    graphic: row.graphic,
    depthRequired: row.depthRequired,
    observationDateTimeRequired: row.observationDateTimeRequired,
    isDepthOfCasing: row.isDepthOfCasing,
    isDepthToWater: row.isDepthToWater,
  }
}

function fieldsFromDto(option: DrillingObservationDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    tablogsAlias: option.tablogsAlias?.trim() || null,
    graphic: option.graphic?.trim() || null,
    depthRequired: option.depthRequired ?? false,
    observationDateTimeRequired: option.observationDateTimeRequired ?? false,
    isDepthOfCasing: option.isDepthOfCasing ?? false,
    isDepthToWater: option.isDepthToWater ?? false,
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.drillingObservationTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: DrillingObservationDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.drillingObservationTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      tablogsAlias: fields.tablogsAlias,
      graphic: fields.graphic,
      depthRequired: fields.depthRequired,
      observationDateTimeRequired: fields.observationDateTimeRequired,
      isDepthOfCasing: fields.isDepthOfCasing,
      isDepthToWater: fields.isDepthToWater,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserDrillingObservations(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userDrillingObservation.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserDrillingObservations(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userDrillingObservation.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserDrillingObservations(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userDrillingObservation.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserDrillingObservationsFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userDrillingObservation.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      tablogsAlias: template.tablogsAlias,
      graphic: template.graphic,
      depthRequired: template.depthRequired,
      observationDateTimeRequired: template.observationDateTimeRequired,
      isDepthOfCasing: template.isDepthOfCasing,
      isDepthToWater: template.isDepthToWater,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserDrillingObservations(userId, logConfigurationId, slug)
}

export async function replaceUserDrillingObservations(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DrillingObservationDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserDrillingObservations(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userDrillingObservation.createMany({
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

  return listUserDrillingObservations(userId, logConfigurationId, slug)
}

export async function findUserDrillingObservation(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userDrillingObservation.findUnique({
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

export async function createUserDrillingObservation(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DrillingObservationDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userDrillingObservation.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserDrillingObservation(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DrillingObservationDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserDrillingObservation(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_DRILLING_OBSERVATION_NOT_FOUND")
  }

  return prisma.userDrillingObservation.update({
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
      depthRequired: fields.depthRequired,
      observationDateTimeRequired: fields.observationDateTimeRequired,
      isDepthOfCasing: fields.isDepthOfCasing,
      isDepthToWater: fields.isDepthToWater,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserDrillingObservation(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserDrillingObservation(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_DRILLING_OBSERVATION_NOT_FOUND")
  }

  await prisma.userDrillingObservation.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
