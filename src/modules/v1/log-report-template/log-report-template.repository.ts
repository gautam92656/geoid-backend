import type { LogReportTemplateLogType, Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../../infrastructure/database/prisma"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogReportTemplateInput = {
  userId: number
  name: string
  logType: LogReportTemplateLogType
  isDefault?: boolean
  config?: Prisma.InputJsonValue
  logConfigurationIds?: Prisma.InputJsonValue
  templateVersion?: number
  sortOrder?: number
}

export type UpdateLogReportTemplateInput = {
  name?: string
  logType?: LogReportTemplateLogType
  isDefault?: boolean
  config?: Prisma.InputJsonValue
  logConfigurationIds?: Prisma.InputJsonValue
  templateVersion?: number
  sortOrder?: number
}

export type LogReportTemplateListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  logType?: LogReportTemplateLogType
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function findAll(filters: LogReportTemplateListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const where = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
    ...(filters.logType ? { logType: filters.logType } : {}),
    ...(filters.search
      ? { name: { contains: filters.search, mode: "insensitive" as const } }
      : {}),
  }

  const allowedSortFields = ["id", "name", "logType", "sortOrder", "createdAt", "updatedAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "sortOrder"
  const sortDir = filters.sortOrder ?? "asc"

  const [data, total] = await Promise.all([
    prisma.logReportTemplate.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: "asc" }],
      skip,
      take,
    }),
    prisma.logReportTemplate.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit) || 1,
  }
}

export async function findAllForUser(userId: number) {
  return prisma.logReportTemplate.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function countForUser(userId: number) {
  return prisma.logReportTemplate.count({ where: { userId, deletedAt: null } })
}

export async function findByIdForUser(id: number, userId: number) {
  return prisma.logReportTemplate.findFirst({ where: { id, userId } })
}

export async function findByNameLogTypeForUser(
  userId: number,
  name: string,
  logType: LogReportTemplateLogType,
  excludeId?: number
) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null

  const templates = await prisma.logReportTemplate.findMany({
    where: {
      userId,
      logType,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, name: true },
  })

  return templates.find((template) => template.name.trim().toLowerCase() === normalized) ?? null
}

export async function create(data: CreateLogReportTemplateInput) {
  return prisma.logReportTemplate.create({
    data: {
      userId: data.userId,
      name: data.name.trim(),
      logType: data.logType,
      isDefault: data.isDefault ?? false,
      config: data.config ?? {},
      logConfigurationIds: data.logConfigurationIds ?? [],
      templateVersion: data.templateVersion ?? 2,
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, userId: number, data: UpdateLogReportTemplateInput) {
  return prisma.logReportTemplate.update({
    where: { id, userId },
    data: {
      name: data.name === undefined ? undefined : data.name.trim(),
      logType: data.logType,
      isDefault: data.isDefault,
      config: data.config,
      logConfigurationIds: data.logConfigurationIds,
      templateVersion: data.templateVersion,
      sortOrder: data.sortOrder,
    },
  })
}

export async function clearDefaultForLogType(
  userId: number,
  logType: LogReportTemplateLogType,
  exceptId?: number
) {
  return prisma.logReportTemplate.updateMany({
    where: {
      userId,
      logType,
      deletedAt: null,
      isDefault: true,
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
    },
    data: { isDefault: false },
  })
}

export async function softDelete(id: number, userId: number) {
  return prisma.logReportTemplate.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}

export async function reorder(userId: number, orderedIds: number[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.logReportTemplate.updateMany({
        where: { id, userId, deletedAt: null },
        data: { sortOrder: index },
      })
    )
  )
}
