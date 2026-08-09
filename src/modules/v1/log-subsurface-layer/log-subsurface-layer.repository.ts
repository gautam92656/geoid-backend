import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogSubsurfaceLayerInput = {
  userId: number
  projectId: number
  logId: number
  depth: string
  classification?: string
  origin?: string
  description?: string
  consistency?: string
  moisture?: string
  remarks?: string
  hatch?: string
  values?: Prisma.InputJsonValue
  sortOrder?: number
}

export type UpdateLogSubsurfaceLayerInput = Partial<
  Omit<CreateLogSubsurfaceLayerInput, "userId" | "projectId" | "logId">
>

export type LogSubsurfaceLayerListFilters = {
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

function normalizeOptionalString(value?: string): string | null {
  if (value === undefined) return undefined as never
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

function buildData(
  data: UpdateLogSubsurfaceLayerInput
): Prisma.LogSubsurfaceLayerUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depth !== undefined) result.depth = data.depth.trim()
  if (data.classification !== undefined) {
    result.classification = normalizeOptionalString(data.classification) ?? ""
  }
  if (data.origin !== undefined) result.origin = normalizeOptionalString(data.origin) ?? ""
  if (data.description !== undefined) {
    result.description = normalizeOptionalString(data.description) ?? ""
  }
  if (data.consistency !== undefined) {
    result.consistency = normalizeOptionalString(data.consistency) ?? ""
  }
  if (data.moisture !== undefined) result.moisture = normalizeOptionalString(data.moisture) ?? ""
  if (data.remarks !== undefined) result.remarks = normalizeOptionalString(data.remarks) ?? ""
  if (data.hatch !== undefined) result.hatch = normalizeOptionalString(data.hatch) || "empty"
  if (data.values !== undefined) result.values = data.values
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogSubsurfaceLayerUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depth",
  "classification",
  "origin",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogSubsurfaceLayerListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogSubsurfaceLayerWhereInput = {
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
            { classification: { contains: search, mode: "insensitive" } },
            { origin: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logSubsurfaceLayer.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logSubsurfaceLayer.count({ where }),
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
  return prisma.logSubsurfaceLayer.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logSubsurfaceLayer.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogSubsurfaceLayerInput) {
  return prisma.logSubsurfaceLayer.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      depth: data.depth.trim(),
      classification: data.classification?.trim() ?? "",
      origin: data.origin?.trim() ?? "",
      description: data.description?.trim() ?? "",
      consistency: data.consistency?.trim() ?? "",
      moisture: data.moisture?.trim() ?? "",
      remarks: data.remarks?.trim() ?? "",
      hatch: data.hatch?.trim() || "empty",
      values: data.values ?? {},
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogSubsurfaceLayerInput) {
  return prisma.logSubsurfaceLayer.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logSubsurfaceLayer.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logSubsurfaceLayer.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}

