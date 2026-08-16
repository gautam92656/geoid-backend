import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log-core-defect.repository"

function asStringIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => String(entry).trim()).filter(Boolean)
}

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: String(item.id),
    logId: item.logId,
    projectId: item.projectId,
    defectTypeId: item.defectTypeId,
    defectTypeName: item.defectTypeName,
    depthFrom: item.depthFrom,
    depthTo: item.depthTo,
    defectOrientation: item.defectOrientation,
    surfaceShapeIds: asStringIdList(item.surfaceShapeIds),
    surfaceRoughnessIds: asStringIdList(item.surfaceRoughnessIds),
    defectCoatingIds: asStringIdList(item.defectCoatingIds),
    defectOpennessIds: asStringIdList(item.defectOpennessIds),
    defectSpacingOverride: item.defectSpacingOverride,
    boundsOnDefectMin: item.boundsOnDefectMin,
    boundsOnDefectMax: item.boundsOnDefectMax,
    comments: item.comments,
    photoName: item.photoName,
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

export async function list(filters: repo.LogCoreDefectListFilters) {
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
  if (!item || item.deletedAt) throw new NotFoundError("Core defect not found")
  return toDTO(item)
}

export type CreateLogCoreDefectBody = {
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

export async function create(
  userId: number,
  projectId: number,
  logId: number,
  input: CreateLogCoreDefectBody
) {
  await assertLogForUser(userId, projectId, logId)

  const sortOrder =
    input.sortOrder ?? (await repo.findMaxSortOrder(logId, userId, projectId)) + 1

  const item = await repo.create({
    userId,
    projectId,
    logId,
    defectTypeId: input.defectTypeId,
    defectTypeName: input.defectTypeName,
    depthFrom: input.depthFrom,
    depthTo: input.depthTo,
    defectOrientation: input.defectOrientation,
    surfaceShapeIds: input.surfaceShapeIds,
    surfaceRoughnessIds: input.surfaceRoughnessIds,
    defectCoatingIds: input.defectCoatingIds,
    defectOpennessIds: input.defectOpennessIds,
    defectSpacingOverride: input.defectSpacingOverride,
    boundsOnDefectMin: input.boundsOnDefectMin,
    boundsOnDefectMax: input.boundsOnDefectMax,
    comments: input.comments,
    photoName: input.photoName,
    sortOrder,
  })
  return toDTO(item)
}

export async function update(
  userId: number,
  projectId: number,
  logId: number,
  id: number,
  input: repo.UpdateLogCoreDefectInput
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Core defect not found")
  }

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
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Core defect not found")
  }

  await repo.softDelete(id, userId, projectId, logId)
  return { message: "Core defect removed" }
}

export async function restoreRecord(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || !existing.deletedAt) {
    throw new NotFoundError("Deleted core defect not found")
  }

  await repo.restore(id, userId, projectId, logId)
  const restored = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!restored) throw new NotFoundError("Core defect not found")
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
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Core defect not found")
  }

  const sortOrder = (await repo.findMaxSortOrder(logId, userId, projectId)) + 1
  const item = await repo.create({
    userId,
    projectId,
    logId,
    defectTypeId: existing.defectTypeId,
    defectTypeName: existing.defectTypeName,
    depthFrom: existing.depthFrom,
    depthTo: existing.depthTo,
    defectOrientation: existing.defectOrientation,
    surfaceShapeIds: asStringIdList(existing.surfaceShapeIds),
    surfaceRoughnessIds: asStringIdList(existing.surfaceRoughnessIds),
    defectCoatingIds: asStringIdList(existing.defectCoatingIds),
    defectOpennessIds: asStringIdList(existing.defectOpennessIds),
    defectSpacingOverride: existing.defectSpacingOverride,
    boundsOnDefectMin: existing.boundsOnDefectMin,
    boundsOnDefectMax: existing.boundsOnDefectMax,
    comments: existing.comments,
    photoName: existing.photoName,
    sortOrder,
  })
  return toDTO(item)
}
