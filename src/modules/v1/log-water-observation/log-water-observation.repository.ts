import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogWaterObservationInput = {
  userId: number
  projectId: number
  logId: number
  depth?: string
  observationTypeId: string
  observationTypeName: string
  observationDate?: string
  observationTime?: string
  comments?: string
  sortOrder?: number
}

export type UpdateLogWaterObservationInput = Partial<
  Omit<CreateLogWaterObservationInput, "userId" | "projectId" | "logId">
>

export type LogWaterObservationListFilters = {
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

function buildData(
  data: UpdateLogWaterObservationInput
): Prisma.LogWaterObservationUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depth !== undefined) result.depth = normalizeOptionalString(data.depth)
  if (data.observationTypeId !== undefined) {
    result.observationTypeId = data.observationTypeId.trim()
  }
  if (data.observationTypeName !== undefined) {
    result.observationTypeName = data.observationTypeName.trim()
  }
  if (data.observationDate !== undefined) {
    result.observationDate = normalizeOptionalString(data.observationDate)
  }
  if (data.observationTime !== undefined) {
    result.observationTime = normalizeOptionalString(data.observationTime)
  }
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogWaterObservationUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depth",
  "observationTypeName",
  "observationDate",
  "observationTime",
  "comments",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogWaterObservationListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogWaterObservationWhereInput = {
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
            { depth: { contains: search, mode: "insensitive" } },
            { observationTypeName: { contains: search, mode: "insensitive" } },
            { observationDate: { contains: search, mode: "insensitive" } },
            { observationTime: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logWaterObservation.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logWaterObservation.count({ where }),
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
  return prisma.logWaterObservation.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logWaterObservation.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogWaterObservationInput) {
  return prisma.logWaterObservation.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      depth: data.depth?.trim() ?? "",
      observationTypeId: data.observationTypeId.trim(),
      observationTypeName: data.observationTypeName.trim(),
      observationDate: data.observationDate?.trim() ?? "",
      observationTime: data.observationTime?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogWaterObservationInput) {
  return prisma.logWaterObservation.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWaterObservation.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWaterObservation.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
