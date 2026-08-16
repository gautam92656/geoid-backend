import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogWellCoverInput = {
  userId: number
  projectId: number
  logId: number
  wellId?: string
  wellIdLabel?: string
  wellCoverTypeId: string
  wellCoverTypeName: string
  depth?: string
  comments?: string
  sortOrder?: number
}

export type UpdateLogWellCoverInput = Partial<
  Omit<CreateLogWellCoverInput, "userId" | "projectId" | "logId">
>

export type LogWellCoverListFilters = {
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

function buildData(data: UpdateLogWellCoverInput): Prisma.LogWellCoverUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.wellId !== undefined) result.wellId = normalizeOptionalString(data.wellId)
  if (data.wellIdLabel !== undefined) {
    result.wellIdLabel = normalizeOptionalString(data.wellIdLabel)
  }
  if (data.wellCoverTypeId !== undefined) result.wellCoverTypeId = data.wellCoverTypeId.trim()
  if (data.wellCoverTypeName !== undefined) {
    result.wellCoverTypeName = data.wellCoverTypeName.trim()
  }
  if (data.depth !== undefined) result.depth = normalizeOptionalString(data.depth)
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogWellCoverUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "wellId",
  "wellIdLabel",
  "wellCoverTypeName",
  "depth",
  "comments",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogWellCoverListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogWellCoverWhereInput = {
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
            { wellCoverTypeName: { contains: search, mode: "insensitive" } },
            { depth: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logWellCover.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logWellCover.count({ where }),
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
  return prisma.logWellCover.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logWellCover.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogWellCoverInput) {
  return prisma.logWellCover.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      wellId: data.wellId?.trim() ?? "",
      wellIdLabel: data.wellIdLabel?.trim() ?? "",
      wellCoverTypeId: data.wellCoverTypeId.trim(),
      wellCoverTypeName: data.wellCoverTypeName.trim(),
      depth: data.depth?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogWellCoverInput) {
  return prisma.logWellCover.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellCover.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellCover.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
