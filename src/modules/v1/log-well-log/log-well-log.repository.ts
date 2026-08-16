import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogWellLogInput = {
  userId: number
  projectId: number
  logId: number
  wellId?: string
  depthFrom?: string
  depthTo?: string
  wellTypeId: string
  wellTypeName: string
  comments?: string
  sortOrder?: number
}

export type UpdateLogWellLogInput = Partial<
  Omit<CreateLogWellLogInput, "userId" | "projectId" | "logId">
>

export type LogWellLogListFilters = {
  userId: number
  projectId: number
  logId: number
  page: number
  limit: number
  includeDeleted?: boolean
  onlyDeleted?: boolean
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

function normalizeOptionalString(value?: string): string {
  if (value === undefined) return ""
  return value.trim()
}

function buildData(data: UpdateLogWellLogInput): Prisma.LogWellLogUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.wellId !== undefined) result.wellId = normalizeOptionalString(data.wellId)
  if (data.depthFrom !== undefined) result.depthFrom = normalizeOptionalString(data.depthFrom)
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.wellTypeId !== undefined) result.wellTypeId = data.wellTypeId.trim()
  if (data.wellTypeName !== undefined) result.wellTypeName = data.wellTypeName.trim()
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogWellLogUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "wellId",
  "depthFrom",
  "depthTo",
  "wellTypeName",
  "comments",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogWellLogListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogWellLogWhereInput = {
    userId: filters.userId,
    projectId: filters.projectId,
    logId: filters.logId,
    ...(filters.onlyDeleted
      ? { deletedAt: { not: null } }
      : filters.includeDeleted
        ? {}
        : { deletedAt: null }),
    ...(search
      ? {
          OR: [
            { wellId: { contains: search, mode: "insensitive" } },
            { depthFrom: { contains: search, mode: "insensitive" } },
            { depthTo: { contains: search, mode: "insensitive" } },
            { wellTypeName: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logWellLog.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logWellLog.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function findByIdForUser(
  id: number,
  userId: number,
  projectId: number,
  logId: number
) {
  return prisma.logWellLog.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logWellLog.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogWellLogInput) {
  return prisma.logWellLog.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      wellId: data.wellId?.trim() ?? "",
      depthFrom: data.depthFrom?.trim() ?? "",
      depthTo: data.depthTo?.trim() ?? "",
      wellTypeId: data.wellTypeId.trim(),
      wellTypeName: data.wellTypeName.trim(),
      comments: data.comments?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogWellLogInput) {
  return prisma.logWellLog.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellLog.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellLog.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
