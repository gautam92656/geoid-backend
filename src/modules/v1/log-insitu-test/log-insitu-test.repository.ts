import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogInsituTestInput = {
  userId: number
  projectId: number
  logId: number
  sampleId?: number | null
  depthFrom: string
  depthTo?: string
  testTypeId: string
  testTypeName: string
  results?: string
  comments?: string
  resultValues?: Prisma.InputJsonValue
  sortOrder?: number
}

export type UpdateLogInsituTestInput = Partial<
  Omit<CreateLogInsituTestInput, "userId" | "projectId" | "logId">
>

export type LogInsituTestListFilters = {
  userId: number
  projectId: number
  logId: number
  page: number
  limit: number
  includeDeleted?: boolean
  onlyDeleted?: boolean
  sampleId?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

function normalizeOptionalString(value?: string): string {
  if (value === undefined) return ""
  return value.trim()
}

function buildData(data: UpdateLogInsituTestInput): Prisma.LogInsituTestUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depthFrom !== undefined) result.depthFrom = data.depthFrom.trim()
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.testTypeId !== undefined) result.testTypeId = data.testTypeId.trim()
  if (data.testTypeName !== undefined) result.testTypeName = data.testTypeName.trim()
  if (data.results !== undefined) result.results = normalizeOptionalString(data.results)
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.resultValues !== undefined) result.resultValues = data.resultValues
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder
  if (data.sampleId !== undefined) {
    result.sample =
      data.sampleId === null
        ? { disconnect: true }
        : { connect: { id: data.sampleId } }
  }

  return result as Prisma.LogInsituTestUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depthFrom",
  "depthTo",
  "testTypeName",
  "results",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogInsituTestListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogInsituTestWhereInput = {
    userId: filters.userId,
    projectId: filters.projectId,
    logId: filters.logId,
    ...(filters.sampleId != null ? { sampleId: filters.sampleId } : {}),
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
            { testTypeName: { contains: search, mode: "insensitive" } },
            { results: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logInsituTest.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logInsituTest.count({ where }),
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
  return prisma.logInsituTest.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logInsituTest.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogInsituTestInput) {
  return prisma.logInsituTest.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      sampleId: data.sampleId ?? null,
      depthFrom: data.depthFrom.trim(),
      depthTo: data.depthTo?.trim() ?? "",
      testTypeId: data.testTypeId.trim(),
      testTypeName: data.testTypeName.trim(),
      results: data.results?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      resultValues: data.resultValues ?? {},
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogInsituTestInput) {
  return prisma.logInsituTest.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logInsituTest.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logInsituTest.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}

export async function findSampleForLog(
  sampleId: number,
  userId: number,
  projectId: number,
  logId: number
) {
  return prisma.logSample.findFirst({
    where: { id: sampleId, userId, projectId, logId, deletedAt: null },
  })
}
