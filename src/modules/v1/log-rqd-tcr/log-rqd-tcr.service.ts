import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log-rqd-tcr.repository"

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: String(item.id),
    logId: item.logId,
    projectId: item.projectId,
    depthFrom: item.depthFrom,
    depthTo: item.depthTo,
    startDate: item.startDate,
    startTime: item.startTime,
    endDate: item.endDate,
    endTime: item.endTime,
    corePieceLength: item.corePieceLength,
    rqdPercent: item.rqdPercent,
    coreLossLength: item.coreLossLength,
    coreRecoveryLength: item.coreRecoveryLength,
    tcrPercent: item.tcrPercent,
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

export async function list(filters: repo.LogRqdTcrListFilters) {
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
  if (!item || item.deletedAt) throw new NotFoundError("RQD/TCR record not found")
  return toDTO(item)
}

export type CreateLogRqdTcrBody = {
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

export async function create(
  userId: number,
  projectId: number,
  logId: number,
  input: CreateLogRqdTcrBody
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
    startDate: input.startDate,
    startTime: input.startTime,
    endDate: input.endDate,
    endTime: input.endTime,
    corePieceLength: input.corePieceLength,
    rqdPercent: input.rqdPercent,
    coreLossLength: input.coreLossLength,
    coreRecoveryLength: input.coreRecoveryLength,
    tcrPercent: input.tcrPercent,
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
  input: repo.UpdateLogRqdTcrInput
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("RQD/TCR record not found")
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
    throw new NotFoundError("RQD/TCR record not found")
  }

  await repo.softDelete(id, userId, projectId, logId)
  return { message: "RQD/TCR record removed" }
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
    throw new NotFoundError("Deleted RQD/TCR record not found")
  }

  await repo.restore(id, userId, projectId, logId)
  const restored = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!restored) throw new NotFoundError("RQD/TCR record not found")
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
    throw new NotFoundError("RQD/TCR record not found")
  }

  const sortOrder = (await repo.findMaxSortOrder(logId, userId, projectId)) + 1
  const item = await repo.create({
    userId,
    projectId,
    logId,
    depthFrom: existing.depthFrom,
    depthTo: existing.depthTo,
    startDate: existing.startDate,
    startTime: existing.startTime,
    endDate: existing.endDate,
    endTime: existing.endTime,
    corePieceLength: existing.corePieceLength,
    rqdPercent: existing.rqdPercent,
    coreLossLength: existing.coreLossLength,
    coreRecoveryLength: existing.coreRecoveryLength,
    tcrPercent: existing.tcrPercent,
    photoName: existing.photoName,
    sortOrder,
  })
  return toDTO(item)
}
