import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogWellCasingTopInput = {
  userId: number
  projectId: number
  logId: number
  elevation?: string
  depthFrom?: string
  depthTo?: string
  casingTypeId: string
  casingTypeName: string
  notes?: string
  sortOrder?: number
}

export type UpdateLogWellCasingTopInput = Partial<
  Omit<CreateLogWellCasingTopInput, "userId" | "projectId" | "logId">
>

export type LogWellCasingTopListFilters = {
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

function buildData(data: UpdateLogWellCasingTopInput): Prisma.LogWellCasingTopUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.elevation !== undefined) result.elevation = normalizeOptionalString(data.elevation)
  if (data.depthFrom !== undefined) result.depthFrom = normalizeOptionalString(data.depthFrom)
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.casingTypeId !== undefined) result.casingTypeId = data.casingTypeId.trim()
  if (data.casingTypeName !== undefined) result.casingTypeName = data.casingTypeName.trim()
  if (data.notes !== undefined) result.notes = normalizeOptionalString(data.notes)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogWellCasingTopUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "elevation",
  "depthFrom",
  "depthTo",
  "casingTypeName",
  "notes",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogWellCasingTopListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogWellCasingTopWhereInput = {
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
            { elevation: { contains: search, mode: "insensitive" } },
            { depthFrom: { contains: search, mode: "insensitive" } },
            { depthTo: { contains: search, mode: "insensitive" } },
            { casingTypeName: { contains: search, mode: "insensitive" } },
            { notes: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logWellCasingTop.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logWellCasingTop.count({ where }),
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
  return prisma.logWellCasingTop.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logWellCasingTop.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogWellCasingTopInput) {
  return prisma.logWellCasingTop.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      elevation: data.elevation?.trim() ?? "",
      depthFrom: data.depthFrom?.trim() ?? "",
      depthTo: data.depthTo?.trim() ?? "",
      casingTypeId: data.casingTypeId.trim(),
      casingTypeName: data.casingTypeName.trim(),
      notes: data.notes?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogWellCasingTopInput) {
  return prisma.logWellCasingTop.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellCasingTop.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logWellCasingTop.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
