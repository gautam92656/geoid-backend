import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogCoreDefectInput = {
  userId: number
  projectId: number
  logId: number
  defectTypeId: string
  defectTypeName: string
  depthFrom: string
  depthTo?: string
  defectOrientation?: string
  surfaceShapeIds?: string[]
  surfaceRoughnessIds?: string[]
  defectCoatingIds?: string[]
  defectOpennessIds?: string[]
  defectSpacingOverride?: string
  boundsOnDefectMin?: string
  boundsOnDefectMax?: string
  comments?: string
  photoName?: string
  sortOrder?: number
}

export type UpdateLogCoreDefectInput = Partial<
  Omit<CreateLogCoreDefectInput, "userId" | "projectId" | "logId">
>

export type LogCoreDefectListFilters = {
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

function normalizeIdList(value?: string[]): string[] {
  if (!value) return []
  return value.map((entry) => entry.trim()).filter(Boolean)
}

function buildData(data: UpdateLogCoreDefectInput): Prisma.LogCoreDefectUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.defectTypeId !== undefined) result.defectTypeId = data.defectTypeId.trim()
  if (data.defectTypeName !== undefined) result.defectTypeName = data.defectTypeName.trim()
  if (data.depthFrom !== undefined) result.depthFrom = data.depthFrom.trim()
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.defectOrientation !== undefined) {
    result.defectOrientation = normalizeOptionalString(data.defectOrientation)
  }
  if (data.surfaceShapeIds !== undefined) result.surfaceShapeIds = normalizeIdList(data.surfaceShapeIds)
  if (data.surfaceRoughnessIds !== undefined) {
    result.surfaceRoughnessIds = normalizeIdList(data.surfaceRoughnessIds)
  }
  if (data.defectCoatingIds !== undefined) {
    result.defectCoatingIds = normalizeIdList(data.defectCoatingIds)
  }
  if (data.defectOpennessIds !== undefined) {
    result.defectOpennessIds = normalizeIdList(data.defectOpennessIds)
  }
  if (data.defectSpacingOverride !== undefined) {
    result.defectSpacingOverride = normalizeOptionalString(data.defectSpacingOverride)
  }
  if (data.boundsOnDefectMin !== undefined) {
    result.boundsOnDefectMin = normalizeOptionalString(data.boundsOnDefectMin)
  }
  if (data.boundsOnDefectMax !== undefined) {
    result.boundsOnDefectMax = normalizeOptionalString(data.boundsOnDefectMax)
  }
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.photoName !== undefined) result.photoName = normalizeOptionalString(data.photoName)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogCoreDefectUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depthFrom",
  "depthTo",
  "defectTypeName",
  "comments",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogCoreDefectListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogCoreDefectWhereInput = {
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
            { defectTypeName: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
            { photoName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logCoreDefect.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logCoreDefect.count({ where }),
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
  return prisma.logCoreDefect.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logCoreDefect.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogCoreDefectInput) {
  return prisma.logCoreDefect.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      defectTypeId: data.defectTypeId.trim(),
      defectTypeName: data.defectTypeName.trim(),
      depthFrom: data.depthFrom.trim(),
      depthTo: data.depthTo?.trim() ?? "",
      defectOrientation: data.defectOrientation?.trim() ?? "",
      surfaceShapeIds: normalizeIdList(data.surfaceShapeIds),
      surfaceRoughnessIds: normalizeIdList(data.surfaceRoughnessIds),
      defectCoatingIds: normalizeIdList(data.defectCoatingIds),
      defectOpennessIds: normalizeIdList(data.defectOpennessIds),
      defectSpacingOverride: data.defectSpacingOverride?.trim() ?? "",
      boundsOnDefectMin: data.boundsOnDefectMin?.trim() ?? "",
      boundsOnDefectMax: data.boundsOnDefectMax?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      photoName: data.photoName?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogCoreDefectInput) {
  return prisma.logCoreDefect.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logCoreDefect.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logCoreDefect.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
