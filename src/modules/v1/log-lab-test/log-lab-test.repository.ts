import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogLabTestInput = {
  userId: number
  projectId: number
  logId: number
  sampleId?: number | null
  sampleNo?: string
  depthFrom: string
  depthTo?: string
  testTypeId: string
  testTypeName: string
  results?: string
  comments?: string
  resultValues?: Prisma.InputJsonValue
  sortOrder?: number
}

export type UpdateLogLabTestInput = Partial<
  Omit<CreateLogLabTestInput, "userId" | "projectId" | "logId">
>

export type LogLabTestListFilters = {
  userId: number
  projectId: number
  logId: number
  page: number
  limit: number
  includeDeleted?: boolean
  onlyDeleted?: boolean
  sampleId?: number
  testTypeId?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

function normalizeOptionalString(value?: string): string {
  if (value === undefined) return ""
  return value.trim()
}

function buildData(data: UpdateLogLabTestInput): Prisma.LogLabTestUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depthFrom !== undefined) result.depthFrom = data.depthFrom.trim()
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.testTypeId !== undefined) result.testTypeId = data.testTypeId.trim()
  if (data.testTypeName !== undefined) result.testTypeName = data.testTypeName.trim()
  if (data.results !== undefined) result.results = normalizeOptionalString(data.results)
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.resultValues !== undefined) result.resultValues = data.resultValues
  if (data.sampleNo !== undefined) result.sampleNo = normalizeOptionalString(data.sampleNo)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder
  if (data.sampleId !== undefined) {
    result.sample =
      data.sampleId === null
        ? { disconnect: true }
        : { connect: { id: data.sampleId } }
  }

  return result as Prisma.LogLabTestUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depthFrom",
  "depthTo",
  "sampleNo",
  "testTypeName",
  "results",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogLabTestListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()
  const testTypeId = filters.testTypeId?.trim()

  const where: Prisma.LogLabTestWhereInput = {
    userId: filters.userId,
    projectId: filters.projectId,
    logId: filters.logId,
    ...(filters.sampleId != null ? { sampleId: filters.sampleId } : {}),
    ...(testTypeId ? { testTypeId } : {}),
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
            { sampleNo: { contains: search, mode: "insensitive" } },
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
    prisma.logLabTest.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logLabTest.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function findTypeGroups(filters: {
  userId: number
  projectId: number
  logId: number
  includeDeleted?: boolean
  onlyDeleted?: boolean
}) {
  const where: Prisma.LogLabTestWhereInput = {
    userId: filters.userId,
    projectId: filters.projectId,
    logId: filters.logId,
    ...(filters.onlyDeleted
      ? { deletedAt: { not: null } }
      : filters.includeDeleted
        ? {}
        : { deletedAt: null }),
  }

  const groups = await prisma.logLabTest.groupBy({
    by: ["testTypeId"],
    where,
    _count: { _all: true },
    _max: { testTypeName: true },
    orderBy: { testTypeId: "asc" },
  })

  return groups
    .map((group) => ({
      testTypeId: group.testTypeId,
      testTypeName: group._max.testTypeName?.trim() || group.testTypeId,
      count: group._count._all,
    }))
    .sort((a, b) => a.testTypeName.localeCompare(b.testTypeName))
}

export async function findByIdForUser(
  id: number,
  userId: number,
  projectId: number,
  logId: number
) {
  return prisma.logLabTest.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logLabTest.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogLabTestInput) {
  return prisma.logLabTest.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      sampleId: data.sampleId ?? null,
      sampleNo: data.sampleNo?.trim() ?? "",
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

export async function update(id: number, data: UpdateLogLabTestInput) {
  return prisma.logLabTest.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logLabTest.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logLabTest.updateMany({
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
