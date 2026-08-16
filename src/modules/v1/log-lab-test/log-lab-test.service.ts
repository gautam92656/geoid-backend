import type { Prisma } from "../../../generated/prisma/client"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log-lab-test.repository"

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: String(item.id),
    logId: item.logId,
    projectId: item.projectId,
    sampleId: item.sampleId != null ? String(item.sampleId) : null,
    sampleNo: item.sampleNo,
    depthFrom: item.depthFrom,
    depthTo: item.depthTo,
    testTypeId: item.testTypeId,
    testTypeName: item.testTypeName,
    results: item.results,
    comments: item.comments,
    resultValues:
      item.resultValues && typeof item.resultValues === "object" && !Array.isArray(item.resultValues)
        ? (item.resultValues as Record<string, unknown>)
        : {},
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    deletedAt: item.deletedAt?.toISOString() ?? null,
  }
}

async function assertProjectForUser(userId: number, projectId: number) {
  const project = await projectRepo.findByIdForUser(projectId, userId)
  if (!project || project.deletedAt) {
    throw new ValidationError("Project not found")
  }
  return project
}

async function assertLogForUser(userId: number, projectId: number, logId: number) {
  await assertProjectForUser(userId, projectId)
  const log = await repo.findLogForUser(logId, userId, projectId)
  if (!log || log.deletedAt) {
    throw new NotFoundError("Log not found")
  }
  return log
}

export async function list(filters: repo.LogLabTestListFilters) {
  await assertLogForUser(filters.userId, filters.projectId, filters.logId)
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function listTypeGroups(filters: {
  userId: number
  projectId: number
  logId: number
  includeDeleted?: boolean
  onlyDeleted?: boolean
}) {
  await assertLogForUser(filters.userId, filters.projectId, filters.logId)
  return repo.findTypeGroups(filters)
}

export async function getOne(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const item = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!item || item.deletedAt) throw new NotFoundError("Lab test result not found")
  return toDTO(item)
}

export type CreateLabTestBody = {
  depthFrom: string
  depthTo?: string
  testTypeId: string
  testTypeName: string
  results?: string
  comments?: string
  resultValues?: Prisma.InputJsonValue
  sampleId?: number | string | null
  sampleNo?: string
  sortOrder?: number
}

function parseOptionalSampleId(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null
  const id = typeof value === "number" ? value : parseInt(String(value), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

export async function create(
  userId: number,
  projectId: number,
  logId: number,
  input: CreateLabTestBody
) {
  await assertLogForUser(userId, projectId, logId)

  const sampleId = parseOptionalSampleId(input.sampleId)
  let sampleNo = input.sampleNo?.trim() ?? ""
  if (sampleId != null) {
    const sample = await repo.findSampleForLog(sampleId, userId, projectId, logId)
    if (!sample) throw new ValidationError("Sample not found for this log")
    if (!sampleNo) sampleNo = sample.sampleNo
  }

  const sortOrder =
    input.sortOrder ?? (await repo.findMaxSortOrder(logId, userId, projectId)) + 1

  const item = await repo.create({
    userId,
    projectId,
    logId,
    sampleId,
    sampleNo,
    depthFrom: input.depthFrom,
    depthTo: input.depthTo,
    testTypeId: input.testTypeId,
    testTypeName: input.testTypeName,
    results: input.results,
    comments: input.comments,
    resultValues: input.resultValues ?? {},
    sortOrder,
  })
  return toDTO(item)
}

export async function update(
  userId: number,
  projectId: number,
  logId: number,
  id: number,
  input: repo.UpdateLogLabTestInput & { sampleId?: number | string | null }
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Lab test result not found")

  const patch: repo.UpdateLogLabTestInput = { ...input }
  if (Object.prototype.hasOwnProperty.call(input, "sampleId")) {
    const sampleId = parseOptionalSampleId(input.sampleId as number | string | null | undefined)
    if (sampleId != null) {
      const sample = await repo.findSampleForLog(sampleId, userId, projectId, logId)
      if (!sample) throw new ValidationError("Sample not found for this log")
      if (input.sampleNo === undefined) patch.sampleNo = sample.sampleNo
    } else if (input.sampleNo === undefined) {
      patch.sampleNo = ""
    }
    patch.sampleId = sampleId
  }

  const updated = await repo.update(id, patch)
  return toDTO(updated)
}

export async function remove(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Lab test result not found")

  await repo.softDelete(id, userId, projectId, logId)
  return { message: "Lab test result removed" }
}

export async function restoreTest(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || !existing.deletedAt) {
    throw new NotFoundError("Deleted lab test result not found")
  }

  await repo.restore(id, userId, projectId, logId)
  const restored = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!restored) throw new NotFoundError("Lab test result not found")
  return toDTO(restored)
}

export async function copy(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Lab test result not found")

  const sortOrder = (await repo.findMaxSortOrder(logId, userId, projectId)) + 1
  const item = await repo.create({
    userId,
    projectId,
    logId,
    sampleId: existing.sampleId,
    sampleNo: existing.sampleNo,
    depthFrom: existing.depthFrom,
    depthTo: existing.depthTo,
    testTypeId: existing.testTypeId,
    testTypeName: existing.testTypeName,
    results: existing.results,
    comments: existing.comments,
    resultValues: (existing.resultValues as Prisma.InputJsonValue) ?? {},
    sortOrder,
  })
  return toDTO(item)
}
