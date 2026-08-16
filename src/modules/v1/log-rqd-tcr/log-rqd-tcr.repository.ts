import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogRqdTcrInput = {
  userId: number
  projectId: number
  logId: number
  depthFrom?: string
  depthTo?: string
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
  corePieceLength?: string
  rqdPercent: string
  coreLossLength: string
  coreRecoveryLength: string
  tcrPercent: string
  photoName?: string
  sortOrder?: number
}

export type UpdateLogRqdTcrInput = Partial<
  Omit<CreateLogRqdTcrInput, "userId" | "projectId" | "logId">
>

export type LogRqdTcrListFilters = {
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

function buildData(data: UpdateLogRqdTcrInput): Prisma.LogRqdTcrUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depthFrom !== undefined) result.depthFrom = normalizeOptionalString(data.depthFrom)
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.startDate !== undefined) result.startDate = normalizeOptionalString(data.startDate)
  if (data.startTime !== undefined) result.startTime = normalizeOptionalString(data.startTime)
  if (data.endDate !== undefined) result.endDate = normalizeOptionalString(data.endDate)
  if (data.endTime !== undefined) result.endTime = normalizeOptionalString(data.endTime)
  if (data.corePieceLength !== undefined) {
    result.corePieceLength = normalizeOptionalString(data.corePieceLength)
  }
  if (data.rqdPercent !== undefined) result.rqdPercent = data.rqdPercent.trim()
  if (data.coreLossLength !== undefined) result.coreLossLength = data.coreLossLength.trim()
  if (data.coreRecoveryLength !== undefined) {
    result.coreRecoveryLength = data.coreRecoveryLength.trim()
  }
  if (data.tcrPercent !== undefined) result.tcrPercent = data.tcrPercent.trim()
  if (data.photoName !== undefined) result.photoName = normalizeOptionalString(data.photoName)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogRqdTcrUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depthFrom",
  "depthTo",
  "startDate",
  "endDate",
  "rqdPercent",
  "tcrPercent",
  "corePieceLength",
  "coreLossLength",
  "coreRecoveryLength",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogRqdTcrListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogRqdTcrWhereInput = {
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
            { rqdPercent: { contains: search, mode: "insensitive" } },
            { tcrPercent: { contains: search, mode: "insensitive" } },
            { corePieceLength: { contains: search, mode: "insensitive" } },
            { coreLossLength: { contains: search, mode: "insensitive" } },
            { coreRecoveryLength: { contains: search, mode: "insensitive" } },
            { photoName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logRqdTcr.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logRqdTcr.count({ where }),
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
  return prisma.logRqdTcr.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logRqdTcr.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogRqdTcrInput) {
  return prisma.logRqdTcr.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      depthFrom: data.depthFrom?.trim() ?? "",
      depthTo: data.depthTo?.trim() ?? "",
      startDate: data.startDate?.trim() ?? "",
      startTime: data.startTime?.trim() ?? "",
      endDate: data.endDate?.trim() ?? "",
      endTime: data.endTime?.trim() ?? "",
      corePieceLength: data.corePieceLength?.trim() ?? "",
      rqdPercent: data.rqdPercent.trim(),
      coreLossLength: data.coreLossLength.trim(),
      coreRecoveryLength: data.coreRecoveryLength.trim(),
      tcrPercent: data.tcrPercent.trim(),
      photoName: data.photoName?.trim() ?? "",
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogRqdTcrInput) {
  return prisma.logRqdTcr.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logRqdTcr.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logRqdTcr.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
