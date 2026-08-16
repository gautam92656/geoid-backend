import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogWellProbeInput = {
  userId: number
  projectId: number
  logId: number
  wellId?: string
  wellIdLabel?: string
  probeTypeId: string
  probeTypeName: string
  depthFrom?: string
  depthTo?: string
  comments?: string
  sortOrder?: number
}

export type UpdateLogWellProbeInput = Partial<
  Omit<CreateLogWellProbeInput, "userId" | "projectId" | "logId">
>

export type LogWellProbeListFilters = {
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

function buildData(data: UpdateLogWellProbeInput): Prisma.LogWellProbeUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.wellId !== undefined) result.wellId = normalizeOptionalString(data.wellId)
  if (data.wellIdLabel !== undefined) {
    result.wellIdLabel = normalizeOptionalString(data.wellIdLabel)
  }
  if (data.probeTypeId !== undefined) result.probeTypeId = data.probeTypeId.trim()
  if (data.probeTypeName !== undefined) result.probeTypeName = data.probeTypeName.trim()
  if (data.depthFrom !== undefined) result.depthFrom = normalizeOptionalString(data.depthFrom)
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogWellProbeUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "wellId",
  "wellIdLabel",
  "probeTypeName",
  "depthFrom",
  "depthTo",
  "comments",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogWellProbeListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogWellProbeWhereInput = {
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
            { wellIdLabel: { contains: search, mode: "insensitive" } },
            { probeTypeName: { contains: search, mode: "insensitive" } },
            { depthFrom: { contains: search, mode: "insensitive" } },
            { depthTo: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logWellProbe.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logWellProbe.count({ where }),
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
  return prisma.logWellProbe.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logWellProbe.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogWellProbeInput) {
  return prisma.logWellProbe.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      wellId: data.wellId?.trim() ?? "",
      wellIdLabel: data.wellIdLabel?.trim() ?? "",
      probeTypeId: data.probeTypeId.trim(),
      probeTypeName: data.probeTypeName.trim(),
      depthFrom: data.depthFrom?.trim() ?? "",
      depthTo: data.depthTo?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogWellProbeInput) {
  return prisma.logWellProbe.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellProbe.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellProbe.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
