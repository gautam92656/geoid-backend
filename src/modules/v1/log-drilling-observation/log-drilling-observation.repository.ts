import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogDrillingObservationInput = {
  userId: number
  projectId: number
  logId: number
  depth?: string
  depthOfCasing?: string
  depthToWater?: string
  observationTypeId: string
  observationTypeName: string
  observationDate?: string
  observationTime?: string
  comments?: string
  sortOrder?: number
}

export type UpdateLogDrillingObservationInput = Partial<
  Omit<CreateLogDrillingObservationInput, "userId" | "projectId" | "logId">
>

export type LogDrillingObservationListFilters = {
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
  data: UpdateLogDrillingObservationInput
): Prisma.LogDrillingObservationUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depth !== undefined) result.depth = normalizeOptionalString(data.depth)
  if (data.depthOfCasing !== undefined) {
    result.depthOfCasing = normalizeOptionalString(data.depthOfCasing)
  }
  if (data.depthToWater !== undefined) {
    result.depthToWater = normalizeOptionalString(data.depthToWater)
  }
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

  return result as Prisma.LogDrillingObservationUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depth",
  "depthOfCasing",
  "depthToWater",
  "observationTypeName",
  "observationDate",
  "observationTime",
  "comments",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogDrillingObservationListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogDrillingObservationWhereInput = {
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
            { depthOfCasing: { contains: search, mode: "insensitive" } },
            { depthToWater: { contains: search, mode: "insensitive" } },
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
    prisma.logDrillingObservation.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logDrillingObservation.count({ where }),
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
  return prisma.logDrillingObservation.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logDrillingObservation.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogDrillingObservationInput) {
  return prisma.logDrillingObservation.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      depth: data.depth?.trim() ?? "",
      depthOfCasing: data.depthOfCasing?.trim() ?? "",
      depthToWater: data.depthToWater?.trim() ?? "",
      observationTypeId: data.observationTypeId.trim(),
      observationTypeName: data.observationTypeName.trim(),
      observationDate: data.observationDate?.trim() ?? "",
      observationTime: data.observationTime?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogDrillingObservationInput) {
  return prisma.logDrillingObservation.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logDrillingObservation.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logDrillingObservation.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
