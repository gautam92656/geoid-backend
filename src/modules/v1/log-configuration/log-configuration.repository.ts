import { prisma } from "../../../infrastructure/database/prisma"
import type { LogConfigurationStatus, Prisma } from "../../../generated/prisma/client"
import type { LogConfigurationSettings } from "../../../shared/constants/logConfigurationSettings"
import type { ProjectDetailFieldsSettings } from "../../../shared/constants/projectDetailFields"
import {
  parseProjectDetailFieldsEnabled,
  serializeProjectDetailFieldsEnabled,
} from "../../../shared/constants/projectDetailFields"
import type { LogDetailFieldsSettings } from "../../../shared/constants/logDetailFields"
import {
  parseLogDetailFieldsEnabled,
  serializeLogDetailFieldsEnabled,
} from "../../../shared/constants/logDetailFields"
import {
  parseEnabledModuleIds,
  serializeEnabledModuleIds,
} from "../../../shared/constants/configModules"
import {
  parseConfigModuleSettings,
  serializeConfigModuleSettings,
  type ConfigModuleSettings,
} from "../../../shared/constants/configModuleSettings"
import { getSkipTake } from "../../../shared/utils/pagination"

type StoredProjectDetailFields = ReturnType<typeof serializeProjectDetailFieldsEnabled>
type StoredLogDetailFields = ReturnType<typeof serializeLogDetailFieldsEnabled>

export type CreateLogConfigurationInput = {
  userId: number
  name: string
  status?: LogConfigurationStatus
  templateSlug?: string | null
  description?: string
  projectDetailFields?: StoredProjectDetailFields | ProjectDetailFieldsSettings
  logDetailFields?: StoredLogDetailFields | LogDetailFieldsSettings
  enabledModules?: string[]
  moduleSettings?: ConfigModuleSettings
} & Partial<LogConfigurationSettings>

export type UpdateLogConfigurationInput = Partial<
  Omit<CreateLogConfigurationInput, "userId">
>

export type LogConfigurationListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  status?: LogConfigurationStatus
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function countForUser(userId: number) {
  return prisma.logConfiguration.count({
    where: { userId, deletedAt: null },
  })
}

export async function findAll(filters: LogConfigurationListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
  }
  const statusWhere = filters.status ? { status: filters.status } : {}
  const searchWhere = filters.search
    ? {
        name: { contains: filters.search, mode: "insensitive" as const },
      }
    : {}

  const where = { ...baseWhere, ...statusWhere, ...searchWhere }

  const allowedSortFields = ["id", "name", "status", "createdAt", "updatedAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "name"
  const sortDir = filters.sortOrder ?? "asc"

  const [data, total] = await Promise.all([
    prisma.logConfiguration.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.logConfiguration.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function findByIdForUser(id: number, userId: number) {
  return prisma.logConfiguration.findFirst({
    where: { id, userId },
  })
}

export async function findByNameForUser(userId: number, name: string, excludeId?: number) {
  const normalized = name.trim().toLowerCase()
  const configurations = await prisma.logConfiguration.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, name: true },
  })

  return (
    configurations.find((config) => config.name.trim().toLowerCase() === normalized) ?? null
  )
}

export async function create(data: CreateLogConfigurationInput) {
  return prisma.logConfiguration.create({
    data: {
      userId: data.userId,
      name: data.name.trim(),
      status: data.status ?? "active",
      templateSlug: data.templateSlug ?? null,
      description: data.description ?? "",
      coordinateSystem: data.coordinateSystem,
      coordinateSystemUnit: data.coordinateSystemUnit,
      allowCoordinateSystemAtLog: data.allowCoordinateSystemAtLog,
      allowCoordinateSystemAtProject: data.allowCoordinateSystemAtProject,
      autoElevation: data.autoElevation,
      coordinateRequirement: data.coordinateRequirement,
      allowDuplicateProjectNumbers: data.allowDuplicateProjectNumbers,
      measurementSystem: data.measurementSystem,
      dateFormat: data.dateFormat,
      elevationUnit: data.elevationUnit,
    },
  })
}

export async function update(id: number, userId: number, data: UpdateLogConfigurationInput) {
  const payload: Prisma.LogConfigurationUpdateInput = {}
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.status !== undefined) payload.status = data.status
  if (data.description !== undefined) payload.description = data.description.trim()
  if (data.coordinateSystem !== undefined) payload.coordinateSystem = data.coordinateSystem.trim()
  if (data.coordinateSystemUnit !== undefined) {
    payload.coordinateSystemUnit = data.coordinateSystemUnit
  }
  if (data.allowCoordinateSystemAtLog !== undefined) {
    payload.allowCoordinateSystemAtLog = data.allowCoordinateSystemAtLog
  }
  if (data.allowCoordinateSystemAtProject !== undefined) {
    payload.allowCoordinateSystemAtProject = data.allowCoordinateSystemAtProject
  }
  if (data.autoElevation !== undefined) payload.autoElevation = data.autoElevation
  if (data.coordinateRequirement !== undefined) {
    payload.coordinateRequirement = data.coordinateRequirement
  }
  if (data.allowDuplicateProjectNumbers !== undefined) {
    payload.allowDuplicateProjectNumbers = data.allowDuplicateProjectNumbers
  }
  if (data.measurementSystem !== undefined) payload.measurementSystem = data.measurementSystem
  if (data.dateFormat !== undefined) payload.dateFormat = data.dateFormat
  if (data.elevationUnit !== undefined) payload.elevationUnit = data.elevationUnit
  if (data.projectDetailFields !== undefined) {
    payload.projectDetailFields = serializeProjectDetailFieldsEnabled({
      enabled: parseProjectDetailFieldsEnabled(data.projectDetailFields),
    })
  }
  if (data.logDetailFields !== undefined) {
    payload.logDetailFields = serializeLogDetailFieldsEnabled({
      enabled: parseLogDetailFieldsEnabled(data.logDetailFields),
    })
  }
  if (data.enabledModules !== undefined) {
    payload.enabledModules = serializeEnabledModuleIds(data.enabledModules)
  }
  if (data.moduleSettings !== undefined || data.enabledModules !== undefined) {
    const existing = await prisma.logConfiguration.findFirst({
      where: { id, userId },
      select: { enabledModules: true, moduleSettings: true },
    })
    if (!existing) {
      return prisma.logConfiguration.update({
        where: { id, userId },
        data: payload,
      })
    }

    const enabledModules =
      data.enabledModules !== undefined
        ? serializeEnabledModuleIds(data.enabledModules)
        : parseEnabledModuleIds(existing.enabledModules)

    const baseSettings =
      data.moduleSettings !== undefined
        ? serializeConfigModuleSettings(data.moduleSettings, enabledModules)
        : parseConfigModuleSettings(existing.moduleSettings, enabledModules)

    payload.moduleSettings = baseSettings as Prisma.InputJsonValue
  }

  return prisma.logConfiguration.update({
    where: { id, userId },
    data: payload,
  })
}

export async function softDelete(id: number, userId: number) {
  return prisma.logConfiguration.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}
