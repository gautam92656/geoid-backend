import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log-sample.repository"

function parseInsituTests(value: unknown): repo.SampleInsituTestDraft[] {
  if (!Array.isArray(value)) return []
  return value.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return {
        id: `draft-${index + 1}`,
        depthFrom: "",
        depthTo: "",
        testTypeId: "",
        testTypeName: "",
        results: "",
      }
    }
    const record = entry as Record<string, unknown>
    return {
      id:
        typeof record.id === "string" && record.id.trim()
          ? record.id.trim()
          : `draft-${index + 1}`,
      depthFrom: typeof record.depthFrom === "string" ? record.depthFrom : "",
      depthTo: typeof record.depthTo === "string" ? record.depthTo : "",
      testTypeId: typeof record.testTypeId === "string" ? record.testTypeId : "",
      testTypeName: typeof record.testTypeName === "string" ? record.testTypeName : "",
      results: typeof record.results === "string" ? record.results : "",
    }
  })
}

function parseLabTestTypeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : String(entry ?? "").trim()))
    .filter((entry) => entry.length > 0)
}

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: String(item.id),
    logId: item.logId,
    projectId: item.projectId,
    depthFrom: item.depthFrom,
    depthTo: item.depthTo,
    sampleTypeId: item.sampleTypeId,
    sampleTypeName: item.sampleTypeName,
    sampleNo: item.sampleNo,
    qcSampleId: item.qcSampleId,
    sampleDate: item.sampleDate,
    sampleTime: item.sampleTime,
    recovery: item.recovery,
    comments: item.comments,
    labTestRequestId: item.labTestRequestId,
    labTestRequestName: item.labTestRequestName,
    labTestTypeIds: parseLabTestTypeIds(item.labTestTypeIds),
    subsurfaceClassification: item.subsurfaceClassification,
    insituTests: parseInsituTests(item.insituTests),
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

export async function list(filters: repo.LogSampleListFilters) {
  await assertLogForUser(filters.userId, filters.projectId, filters.logId)
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const item = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!item || item.deletedAt) throw new NotFoundError("Sample not found")
  return toDTO(item)
}

export type CreateLogSampleBody = {
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
  insituTests?: repo.SampleInsituTestDraft[]
  sortOrder?: number
}

export async function create(
  userId: number,
  projectId: number,
  logId: number,
  input: CreateLogSampleBody
) {
  await assertLogForUser(userId, projectId, logId)

  const sortOrder =
    input.sortOrder ?? (await repo.findMaxSortOrder(logId, userId, projectId)) + 1

  const item = await repo.create({
    userId,
    projectId,
    logId,
    depthFrom: input.depthFrom,
    depthTo: input.depthTo,
    sampleTypeId: input.sampleTypeId,
    sampleTypeName: input.sampleTypeName,
    sampleNo: input.sampleNo,
    qcSampleId: input.qcSampleId,
    sampleDate: input.sampleDate,
    sampleTime: input.sampleTime,
    recovery: input.recovery,
    comments: input.comments,
    labTestRequestId: input.labTestRequestId,
    labTestRequestName: input.labTestRequestName,
    labTestTypeIds: input.labTestTypeIds,
    subsurfaceClassification: input.subsurfaceClassification,
    insituTests: input.insituTests,
    sortOrder,
  })
  return toDTO(item)
}

export async function update(
  userId: number,
  projectId: number,
  logId: number,
  id: number,
  input: repo.UpdateLogSampleInput
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Sample not found")

  const updated = await repo.update(id, input)
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
  if (!existing || existing.deletedAt) throw new NotFoundError("Sample not found")

  await repo.softDelete(id, userId, projectId, logId)
  return { message: "Sample removed" }
}

export async function restoreSample(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || !existing.deletedAt) {
    throw new NotFoundError("Deleted sample not found")
  }

  await repo.restore(id, userId, projectId, logId)
  const restored = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!restored) throw new NotFoundError("Sample not found")
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
  if (!existing || existing.deletedAt) throw new NotFoundError("Sample not found")

  const sortOrder = (await repo.findMaxSortOrder(logId, userId, projectId)) + 1
  const item = await repo.create({
    userId,
    projectId,
    logId,
    depthFrom: existing.depthFrom,
    depthTo: existing.depthTo,
    sampleTypeId: existing.sampleTypeId,
    sampleTypeName: existing.sampleTypeName,
    sampleNo: existing.sampleNo,
    qcSampleId: existing.qcSampleId,
    sampleDate: existing.sampleDate,
    sampleTime: existing.sampleTime,
    recovery: existing.recovery,
    comments: existing.comments,
    labTestRequestId: existing.labTestRequestId,
    labTestRequestName: existing.labTestRequestName,
    labTestTypeIds: parseLabTestTypeIds(existing.labTestTypeIds),
    subsurfaceClassification: existing.subsurfaceClassification,
    insituTests: parseInsituTests(existing.insituTests),
    sortOrder,
  })
  return toDTO(item)
}
