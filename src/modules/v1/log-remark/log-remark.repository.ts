import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogRemarkInput = {
  userId: number
  projectId: number
  logId: number
  depthFrom: string
  depthTo?: string
  remarkTypeId: string
  remarkTypeName: string
  remarks?: string
  sortOrder?: number
}

export type UpdateLogRemarkInput = Partial<
  Omit<CreateLogRemarkInput, "userId" | "projectId" | "logId">
>

export type LogRemarkListFilters = {
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

function buildData(data: UpdateLogRemarkInput): Prisma.LogRemarkUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depthFrom !== undefined) result.depthFrom = data.depthFrom.trim()
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.remarkTypeId !== undefined) result.remarkTypeId = data.remarkTypeId.trim()
  if (data.remarkTypeName !== undefined) result.remarkTypeName = data.remarkTypeName.trim()
  if (data.remarks !== undefined) result.remarks = normalizeOptionalString(data.remarks)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogRemarkUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depthFrom",
  "depthTo",
  "remarkTypeName",
  "remarks",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogRemarkListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogRemarkWhereInput = {
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
            { depthFrom: { contains: search, mode: "insensitive" } },
            { depthTo: { contains: search, mode: "insensitive" } },
            { remarkTypeName: { contains: search, mode: "insensitive" } },
            { remarks: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logRemark.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logRemark.count({ where }),
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
  return prisma.logRemark.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logRemark.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogRemarkInput) {
  return prisma.logRemark.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      depthFrom: data.depthFrom.trim(),
      depthTo: data.depthTo?.trim() ?? "",
      remarkTypeId: data.remarkTypeId.trim(),
      remarkTypeName: data.remarkTypeName.trim(),
      remarks: data.remarks?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogRemarkInput) {
  return prisma.logRemark.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logRemark.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logRemark.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
