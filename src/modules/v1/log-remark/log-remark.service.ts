import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log-remark.repository"

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: String(item.id),
    logId: item.logId,
    projectId: item.projectId,
    depthFrom: item.depthFrom,
    depthTo: item.depthTo,
    remarkTypeId: item.remarkTypeId,
    remarkTypeName: item.remarkTypeName,
    remarks: item.remarks,
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

export async function list(filters: repo.LogRemarkListFilters) {
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
  if (!item || item.deletedAt) throw new NotFoundError("Log remark not found")
  return toDTO(item)
}

export type CreateLogRemarkBody = {
  depthFrom: string
  depthTo?: string
  remarkTypeId: string
  remarkTypeName: string
  remarks?: string
  sortOrder?: number
}

export async function create(
  userId: number,
  projectId: number,
  logId: number,
  input: CreateLogRemarkBody
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
    remarkTypeId: input.remarkTypeId,
    remarkTypeName: input.remarkTypeName,
    remarks: input.remarks,
    sortOrder,
  })
  return toDTO(item)
}

export async function update(
  userId: number,
  projectId: number,
  logId: number,
  id: number,
  input: repo.UpdateLogRemarkInput
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Log remark not found")

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
  if (!existing || existing.deletedAt) throw new NotFoundError("Log remark not found")

  await repo.softDelete(id, userId, projectId, logId)
  return { message: "Log remark removed" }
}

export async function restoreRemark(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || !existing.deletedAt) {
    throw new NotFoundError("Deleted log remark not found")
  }

  await repo.restore(id, userId, projectId, logId)
  const restored = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!restored) throw new NotFoundError("Log remark not found")
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
  if (!existing || existing.deletedAt) throw new NotFoundError("Log remark not found")

  const sortOrder = (await repo.findMaxSortOrder(logId, userId, projectId)) + 1
  const item = await repo.create({
    userId,
    projectId,
    logId,
    depthFrom: existing.depthFrom,
    depthTo: existing.depthTo,
    remarkTypeId: existing.remarkTypeId,
    remarkTypeName: existing.remarkTypeName,
    remarks: existing.remarks,
    sortOrder,
  })
  return toDTO(item)
}
