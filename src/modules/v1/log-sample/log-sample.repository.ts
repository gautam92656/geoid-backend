import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type SampleInsituTestDraft = {
  id?: string
  depthFrom: string
  depthTo?: string
  testTypeId: string
  testTypeName: string
  results?: string
}

export type CreateLogSampleInput = {
  userId: number
  projectId: number
  logId: number
  depthFrom: string
  depthTo?: string
  sampleTypeId: string
  sampleTypeName: string
  sampleNo?: string
  qcSampleId?: string
  sampleDate?: string
  sampleTime?: string
  recovery?: string
  comments?: string
  labTestRequestId?: string
  labTestRequestName?: string
  labTestTypeIds?: string[]
  subsurfaceClassification?: string
  insituTests?: SampleInsituTestDraft[]
  sortOrder?: number
}

export type UpdateLogSampleInput = Partial<
  Omit<CreateLogSampleInput, "userId" | "projectId" | "logId">
>

export type LogSampleListFilters = {
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

function normalizeInsituTests(value?: SampleInsituTestDraft[]): Prisma.InputJsonValue {
  if (!Array.isArray(value)) return []
  return value.map((entry, index) => ({
    id: typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : `draft-${index + 1}`,
    depthFrom: String(entry.depthFrom ?? "").trim(),
    depthTo: String(entry.depthTo ?? "").trim(),
    testTypeId: String(entry.testTypeId ?? "").trim(),
    testTypeName: String(entry.testTypeName ?? "").trim(),
    results: String(entry.results ?? "").trim(),
  }))
}

function normalizeLabTestTypeIds(value?: string[]): Prisma.InputJsonValue {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => String(entry ?? "").trim())
    .filter((entry) => entry.length > 0)
}

function buildData(data: UpdateLogSampleInput): Prisma.LogSampleUpdateInput {
  const result: Record<string, unknown> = {}

  if (data.depthFrom !== undefined) result.depthFrom = data.depthFrom.trim()
  if (data.depthTo !== undefined) result.depthTo = normalizeOptionalString(data.depthTo)
  if (data.sampleTypeId !== undefined) result.sampleTypeId = data.sampleTypeId.trim()
  if (data.sampleTypeName !== undefined) result.sampleTypeName = data.sampleTypeName.trim()
  if (data.sampleNo !== undefined) result.sampleNo = normalizeOptionalString(data.sampleNo)
  if (data.qcSampleId !== undefined) result.qcSampleId = normalizeOptionalString(data.qcSampleId)
  if (data.sampleDate !== undefined) result.sampleDate = normalizeOptionalString(data.sampleDate)
  if (data.sampleTime !== undefined) result.sampleTime = normalizeOptionalString(data.sampleTime)
  if (data.recovery !== undefined) result.recovery = normalizeOptionalString(data.recovery)
  if (data.comments !== undefined) result.comments = normalizeOptionalString(data.comments)
  if (data.labTestRequestId !== undefined) {
    result.labTestRequestId = normalizeOptionalString(data.labTestRequestId)
  }
  if (data.labTestRequestName !== undefined) {
    result.labTestRequestName = normalizeOptionalString(data.labTestRequestName)
  }
  if (data.labTestTypeIds !== undefined) {
    result.labTestTypeIds = normalizeLabTestTypeIds(data.labTestTypeIds)
  }
  if (data.subsurfaceClassification !== undefined) {
    result.subsurfaceClassification = normalizeOptionalString(data.subsurfaceClassification)
  }
  if (data.insituTests !== undefined) result.insituTests = normalizeInsituTests(data.insituTests)
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder

  return result as Prisma.LogSampleUpdateInput
}

const SORTABLE_FIELDS = new Set([
  "id",
  "depthFrom",
  "depthTo",
  "sampleTypeName",
  "sampleNo",
  "sampleDate",
  "sortOrder",
  "createdAt",
  "updatedAt",
])

export async function findAll(filters: LogSampleListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const search = filters.search?.trim()

  const where: Prisma.LogSampleWhereInput = {
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
            { sampleTypeName: { contains: search, mode: "insensitive" } },
            { sampleNo: { contains: search, mode: "insensitive" } },
            { qcSampleId: { contains: search, mode: "insensitive" } },
            { comments: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const sortField =
    filters.sortBy && SORTABLE_FIELDS.has(filters.sortBy) ? filters.sortBy : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? "desc" : "asc"

  const [data, total] = await Promise.all([
    prisma.logSample.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
      skip,
      take,
    }),
    prisma.logSample.count({ where }),
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
  return prisma.logSample.findFirst({
    where: { id, userId, projectId, logId },
  })
}

export async function findMaxSortOrder(logId: number, userId: number, projectId: number) {
  const result = await prisma.logSample.aggregate({
    where: { logId, userId, projectId, deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}

export async function create(data: CreateLogSampleInput) {
  return prisma.logSample.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      logId: data.logId,
      depthFrom: data.depthFrom.trim(),
      depthTo: data.depthTo?.trim() ?? "",
      sampleTypeId: data.sampleTypeId.trim(),
      sampleTypeName: data.sampleTypeName.trim(),
      sampleNo: data.sampleNo?.trim() ?? "",
      qcSampleId: data.qcSampleId?.trim() ?? "",
      sampleDate: data.sampleDate?.trim() ?? "",
      sampleTime: data.sampleTime?.trim() ?? "",
      recovery: data.recovery?.trim() ?? "",
      comments: data.comments?.trim() ?? "",
      labTestRequestId: data.labTestRequestId?.trim() ?? "",
      labTestRequestName: data.labTestRequestName?.trim() ?? "",
      labTestTypeIds: normalizeLabTestTypeIds(data.labTestTypeIds),
      subsurfaceClassification: data.subsurfaceClassification?.trim() ?? "",
      insituTests: normalizeInsituTests(data.insituTests),
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogSampleInput) {
  return prisma.logSample.update({
    where: { id },
    data: buildData(data),
  })
}

export async function softDelete(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logSample.updateMany({
    where: { id, userId, projectId, logId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

export async function restore(id: number, userId: number, projectId: number, logId: number) {
  return prisma.logSample.updateMany({
    where: { id, userId, projectId, logId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })
}

export async function findLogForUser(logId: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id: logId, userId, projectId },
  })
}
