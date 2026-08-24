import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log-finish-log.repository"

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: String(item.id),
    logId: item.logId,
    projectId: item.projectId,
    userId: item.userId,
    finishTypeId: item.finishTypeId,
    finishTypeName: item.finishTypeName,
    completedDate: item.completedDate?.toISOString().slice(0, 10) ?? "",
    endDepth: item.endDepth,
    comments: item.comments,
    scaleLogReport: item.scaleLogReport,
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

export async function list(filters: repo.LogFinishLogListFilters) {
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
  if (!item || item.deletedAt) throw new NotFoundError("Finish log not found")
  return toDTO(item)
}

export type CreateLogFinishLogBody = {
  finishTypeId: string
  finishTypeName: string
  completedDate?: string | null
  endDepth?: string
  comments?: string
  scaleLogReport?: boolean
  sortOrder?: number
}

export async function create(
  userId: number,
  projectId: number,
  logId: number,
  input: CreateLogFinishLogBody
) {
  await assertLogForUser(userId, projectId, logId)

  const sortOrder =
    input.sortOrder ?? (await repo.findMaxSortOrder(logId, userId, projectId)) + 1

  const item = await repo.create({
    userId,
    projectId,
    logId,
    finishTypeId: input.finishTypeId,
    finishTypeName: input.finishTypeName,
    completedDate: input.completedDate,
    endDepth: input.endDepth,
    comments: input.comments,
    scaleLogReport: input.scaleLogReport,
    sortOrder,
  })

  await repo.syncParentLogFinishFields(logId, userId, projectId, {
    finishTypeName: item.finishTypeName,
    completedDate: item.completedDate?.toISOString().slice(0, 10) ?? "",
    endDepth: item.endDepth,
    comments: item.comments,
    scaleLogReport: item.scaleLogReport,
  })

  return toDTO(item)
}

export async function update(
  userId: number,
  projectId: number,
  logId: number,
  id: number,
  input: repo.UpdateLogFinishLogInput
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Finish log not found")
  }

  const updated = await repo.update(id, input)

  await repo.syncParentLogFinishFields(logId, userId, projectId, {
    finishTypeName: updated.finishTypeName,
    completedDate: updated.completedDate?.toISOString().slice(0, 10) ?? "",
    endDepth: updated.endDepth,
    comments: updated.comments,
    scaleLogReport: updated.scaleLogReport,
  })

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
    throw new NotFoundError("Finish log not found")
  }

  await repo.softDelete(id, userId, projectId, logId)
  return { message: "Finish log removed" }
}

export async function restoreFinishLog(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || !existing.deletedAt) {
    throw new NotFoundError("Deleted finish log not found")
  }

  await repo.restore(id, userId, projectId, logId)
  const restored = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!restored) throw new NotFoundError("Finish log not found")
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
    throw new NotFoundError("Finish log not found")
  }

  const sortOrder = (await repo.findMaxSortOrder(logId, userId, projectId)) + 1
  const item = await repo.create({
    userId,
    projectId,
    logId,
    finishTypeId: existing.finishTypeId,
    finishTypeName: existing.finishTypeName,
    completedDate: existing.completedDate?.toISOString().slice(0, 10) ?? "",
    endDepth: existing.endDepth,
    comments: existing.comments,
    scaleLogReport: existing.scaleLogReport,
    sortOrder,
  })

  await repo.syncParentLogFinishFields(logId, userId, projectId, {
    finishTypeName: item.finishTypeName,
    completedDate: item.completedDate?.toISOString().slice(0, 10) ?? "",
    endDepth: item.endDepth,
    comments: item.comments,
    scaleLogReport: item.scaleLogReport,
  })

  return toDTO(item)
}
