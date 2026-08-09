import type { Prisma } from "../../../generated/prisma/client"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log-subsurface-layer.repository"

const HATCH_VALUES = new Set(["concrete", "fill", "clay", "silt", "sand", "empty"])

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: String(item.id),
    logId: item.logId,
    projectId: item.projectId,
    depth: item.depth,
    classification: item.classification,
    origin: item.origin,
    description: item.description,
    consistency: item.consistency,
    moisture: item.moisture,
    remarks: item.remarks,
    hatch: HATCH_VALUES.has(item.hatch) ? item.hatch : "empty",
    values:
      item.values && typeof item.values === "object" && !Array.isArray(item.values)
        ? (item.values as Record<string, unknown>)
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

function normalizeHatch(value?: string): string | undefined {
  if (value === undefined) return undefined
  const trimmed = value.trim().toLowerCase()
  return HATCH_VALUES.has(trimmed) ? trimmed : "empty"
}

export async function list(filters: repo.LogSubsurfaceLayerListFilters) {
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
  if (!item || item.deletedAt) throw new NotFoundError("Subsurface layer not found")
  return toDTO(item)
}

export type CreateLayerBody = {
  depth: string
  classification?: string
  origin?: string
  description?: string
  consistency?: string
  moisture?: string
  remarks?: string
  hatch?: string
  values?: Prisma.InputJsonValue
  sortOrder?: number
}

export async function create(
  userId: number,
  projectId: number,
  logId: number,
  input: CreateLayerBody
) {
  await assertLogForUser(userId, projectId, logId)

  const sortOrder =
    input.sortOrder ??
    (await repo.findMaxSortOrder(logId, userId, projectId)) + 1

  const item = await repo.create({
    userId,
    projectId,
    logId,
    depth: input.depth,
    classification: input.classification,
    origin: input.origin,
    description: input.description,
    consistency: input.consistency,
    moisture: input.moisture,
    remarks: input.remarks,
    hatch: normalizeHatch(input.hatch),
    values: input.values ?? {},
    sortOrder,
  })
  return toDTO(item)
}

export async function update(
  userId: number,
  projectId: number,
  logId: number,
  id: number,
  input: repo.UpdateLogSubsurfaceLayerInput
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Subsurface layer not found")

  const updated = await repo.update(id, {
    ...input,
    hatch: normalizeHatch(input.hatch),
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
  if (!existing || existing.deletedAt) throw new NotFoundError("Subsurface layer not found")

  await repo.softDelete(id, userId, projectId, logId)
  return { message: "Subsurface layer removed" }
}

export async function restoreLayer(
  userId: number,
  projectId: number,
  logId: number,
  id: number
) {
  await assertLogForUser(userId, projectId, logId)
  const existing = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!existing || !existing.deletedAt) {
    throw new NotFoundError("Deleted subsurface layer not found")
  }

  await repo.restore(id, userId, projectId, logId)
  const restored = await repo.findByIdForUser(id, userId, projectId, logId)
  if (!restored) throw new NotFoundError("Subsurface layer not found")
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
  if (!existing || existing.deletedAt) throw new NotFoundError("Subsurface layer not found")

  const sortOrder = (await repo.findMaxSortOrder(logId, userId, projectId)) + 1
  const item = await repo.create({
    userId,
    projectId,
    logId,
    depth: existing.depth,
    classification: existing.classification,
    origin: existing.origin,
    description: existing.description,
    consistency: existing.consistency,
    moisture: existing.moisture,
    remarks: existing.remarks,
    hatch: existing.hatch,
    values: (existing.values as Prisma.InputJsonValue) ?? {},
    sortOrder,
  })
  return toDTO(item)
}
