import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogFinishLogInput = {
  userId: number
  projectId: number
  logId: number
  finishTypeId: string
  finishTypeName: string
  completedDate?: string | null
  endDepth?: string
  comments?: string
  scaleLogReport?: boolean
  sortOrder?: number
}

export type UpdateLogFinishLogInput = Partial<
  Omit<CreateLogFinishLogInput, "userId" | "projectId" | "logId">
>

export type LogFinishLogListFilters = {
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

function parseDate(value?: string | null): Date | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const date = new Date(`${trimmed}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function buildData(data: UpdateLogFinishLogInput): Prisma.LogFinishLogUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.finishTypeId !== undefined) result.finishTypeId = data.finishTypeId.trim()
  if (data.finishTypeName !== undefined) result.finishTypeName = data.finishTypeName.trim()
  if (data.completedDate !== undefined) result.completedDate = parseDate(data.completedDate)
  if (data.endDepth !== undefined) result.endDepth = normalizeOptionalString(data.endDepth)
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.scaleLogReport !== undefined) result.scaleLogReport = Boolean(data.scaleLogReport)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogFinishLogUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "finishTypeName",
  "completedDate",
  "endDepth",
  "comments",
  "scaleLogReport",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogFinishLogListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogFinishLogWhereInput = {
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
            { finishTypeName: { contains: search, mode: "insensitive" } },
            { endDepth: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logFinishLog.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logFinishLog.count({ where }),
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
  return prisma.logFinishLog.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logFinishLog.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogFinishLogInput) {
  return prisma.logFinishLog.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      finishTypeId: data.finishTypeId.trim(),
      finishTypeName: data.finishTypeName.trim(),
      completedDate: parseDate(data.completedDate),
      endDepth: data.endDepth?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      scaleLogReport: Boolean(data.scaleLogReport),
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogFinishLogInput) {
  return prisma.logFinishLog.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logFinishLog.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logFinishLog.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}

/** Keep the parent log's finish fields in sync with the latest finish-log entry. */
export async function syncParentLogFinishFields(
  logId: number,
  userId: number,
  projectId: number,
  data: {
    finishTypeName: string
    completedDate?: string | null
    endDepth?: string
    comments?: string
    scaleLogReport?: boolean
  }
) {
  return prisma.log.updateMany({
    where: { id: logId, userId, projectId, deletedAt: null },
    data: {
      finishingReason: data.finishTypeName.trim() || null,
      finishLogDate: parseDate(data.completedDate),
      endDepth: data.endDepth?.trim() || null,
      finishingComment: data.comments?.trim() || null,
      scaleLogReport: Boolean(data.scaleLogReport),
    },
  })
}
