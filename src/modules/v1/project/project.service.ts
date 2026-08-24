import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as clientRepo from "../client/client.repository"
import {
  assertCoordinatesForRequirement,
  resolveCoordinateRequirementForUser,
} from "../log-configuration/log-configuration.coordinateRequirement"
import * as logConfigRepo from "../log-configuration/log-configuration.repository"
import * as historyRepo from "./project-status-history.repository"
import { toDTO, toProjectStatus } from "./project.mapper"
import * as repo from "./project.repository"

export { STATUS_LABELS, toDTO, toProjectStatus } from "./project.mapper"

async function assertClientForUser(userId: number, clientId?: number) {
  if (clientId === undefined || clientId === null) return
  const client = await clientRepo.findByIdForUser(clientId, userId)
  if (!client || client.deletedAt) {
    throw new ValidationError("Client not found")
  }
}

async function allowsDuplicateProjectNumbers(
  userId: number,
  logConfigId?: string | null
): Promise<boolean> {
  const trimmed = logConfigId?.trim()
  if (!trimmed) return false

  const numericId = Number.parseInt(trimmed, 10)
  if (!Number.isInteger(numericId) || numericId < 1) return false

  const config = await logConfigRepo.findByIdForUser(numericId, userId)
  if (!config || config.deletedAt) return false

  return Boolean(config.allowDuplicateProjectNumbers)
}

export async function list(filters: repo.ProjectListFilters) {
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(userId: number, id: number) {
  const project = await repo.findByIdForUser(id, userId)
  if (!project || project.deletedAt) throw new NotFoundError("Project not found")
  return toDTO(project)
}

export async function getByProjectNo(userId: number, projectNo: string) {
  const project = await repo.findFullByProjectNoForUser(userId, projectNo)
  if (!project || project.deletedAt) throw new NotFoundError("Project not found")
  return toDTO(project)
}

export async function create(userId: number, input: Omit<repo.CreateProjectInput, "userId">) {
  const allowDuplicates = await allowsDuplicateProjectNumbers(userId, input.logConfigId)
  if (!allowDuplicates) {
    const duplicate = await repo.findByProjectNoForUser(userId, input.projectNo)
    if (duplicate) {
      throw new ConflictError("A project with this project number already exists.")
    }
  }

  await assertClientForUser(userId, input.clientId)

  const coordinateRequirement = await resolveCoordinateRequirementForUser(
    userId,
    input.logConfigId
  )
  assertCoordinatesForRequirement(coordinateRequirement, input.latitude, input.longitude)

  const project = await repo.create({
    ...input,
    userId,
    status: input.status ? toProjectStatus(input.status) : undefined,
  })

  await historyRepo.createEntry(project.id, userId, project.status)

  return toDTO(project)
}

export async function update(userId: number, id: number, input: repo.UpdateProjectInput) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt || existing.archivedAt) {
    throw new NotFoundError("Project not found")
  }

  if (input.projectNo !== undefined) {
    const logConfigId =
      input.logConfigId !== undefined ? input.logConfigId : existing.logConfigId
    const allowDuplicates = await allowsDuplicateProjectNumbers(userId, logConfigId)
    if (!allowDuplicates) {
      const duplicate = await repo.findByProjectNoForUser(userId, input.projectNo, id)
      if (duplicate) {
        throw new ConflictError("A project with this project number already exists.")
      }
    }
  }

  if (input.clientId !== undefined && input.clientId !== null) {
    await assertClientForUser(userId, input.clientId)
  }

  const nextLogConfigId =
    input.logConfigId !== undefined ? input.logConfigId : existing.logConfigId
  const nextLatitude = input.latitude !== undefined ? input.latitude : existing.latitude
  const nextLongitude = input.longitude !== undefined ? input.longitude : existing.longitude
  const coordinateRequirement = await resolveCoordinateRequirementForUser(
    userId,
    nextLogConfigId
  )
  assertCoordinatesForRequirement(coordinateRequirement, nextLatitude, nextLongitude)

  const nextStatus =
    input.status !== undefined ? toProjectStatus(input.status) : undefined
  const statusChanged =
    nextStatus !== undefined && nextStatus !== existing.status

  const updated = await repo.update(id, userId, {
    ...input,
    status: nextStatus,
  })

  if (statusChanged && nextStatus !== undefined) {
    await historyRepo.createEntry(id, userId, nextStatus)
  }

  return toDTO(updated)
}

export async function archive(userId: number, id: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt || existing.archivedAt) {
    throw new NotFoundError("Project not found")
  }

  await repo.archive(id, userId)
  return { message: "Project archived" }
}

export async function remove(userId: number, id: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Project not found")
  await repo.softDelete(id, userId)
  return { message: "Project removed" }
}
