import type { LogStatus, LogType } from "../../../generated/prisma/client"
import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  assertCoordinatesForRequirement,
  resolveCoordinateRequirementForUser,
} from "../log-configuration/log-configuration.coordinateRequirement"
import * as projectRepo from "../project/project.repository"
import * as repo from "./log.repository"

const STATUS_LABELS: Record<LogStatus, string> = {
  to_do: "To do",
  in_progress: "In progress",
  field: "Field",
  lab: "Lab",
  completed: "Completed",
  preliminary: "Preliminary",
  draft: "Draft",
  final: "Final",
  in_active: "In Active",
}

const STATUS_VALUES: Record<string, LogStatus> = {
  "To do": "to_do",
  "In progress": "in_progress",
  Field: "field",
  Lab: "lab",
  Completed: "completed",
  Preliminary: "preliminary",
  Draft: "draft",
  Final: "final",
  "In Active": "in_active",
  to_do: "to_do",
  in_progress: "in_progress",
  field: "field",
  lab: "lab",
  completed: "completed",
  preliminary: "preliminary",
  draft: "draft",
  final: "final",
  in_active: "in_active",
}

const TYPE_LABELS: Record<LogType, string> = {
  borelog: "Borelog",
  test_pit: "Test Pit",
  probe: "Probe",
  monitoring_well: "Monitoring Well",
  inclined_borehole: "Inclined Borehole",
}

const TYPE_VALUES: Record<string, LogType> = {
  borelog: "borelog",
  "test-pit": "test_pit",
  test_pit: "test_pit",
  probe: "probe",
  "monitoring-well": "monitoring_well",
  monitoring_well: "monitoring_well",
  "inclined-borehole": "inclined_borehole",
  inclined_borehole: "inclined_borehole",
  Borelog: "borelog",
  "Test Pit": "test_pit",
  Probe: "probe",
  "Monitoring Well": "monitoring_well",
  "Inclined Borehole": "inclined_borehole",
}

export function toLogStatus(value: string): LogStatus {
  return STATUS_VALUES[value] ?? "to_do"
}

export function toLogType(value: string): LogType {
  return TYPE_VALUES[value] ?? "borelog"
}

function toDTO(log: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: log.id,
    projectId: log.projectId,
    proposedBorelogId: log.proposedBorelogId ? String(log.proposedBorelogId) : "",
    logNumber: log.logNumber,
    logConfigId: log.logConfigId,
    logType: log.logType,
    logTypeLabel: TYPE_LABELS[log.logType],
    logStatus: STATUS_LABELS[log.logStatus],
    drillingDate: log.drillingDate?.toISOString().slice(0, 10) ?? "",
    drillingTime: log.drillingTime ?? "",
    finishLogDate: log.finishLogDate?.toISOString().slice(0, 10) ?? "",
    finishLogTime: log.finishLogTime ?? "",
    endDepth: log.endDepth ?? "",
    finishingReason: log.finishingReason ?? "",
    finishingComment: log.finishingComment ?? "",
    scaleLogReport: log.scaleLogReport ?? false,
    coordinateSystem: log.coordinateSystem ?? "",
    latitude: log.latitude ?? "",
    longitude: log.longitude ?? "",
    easting: log.easting ?? "",
    northing: log.northing ?? "",
    utmZone: log.utmZone ?? "",
    elevation: log.elevation ?? "",
    station: log.station ?? "",
    locationComment: log.locationComment ?? "",
    supplierId: log.supplierId ? String(log.supplierId) : "",
    equipmentId: log.equipmentId ? String(log.equipmentId) : "",
    loggedBy: log.loggedBy ?? "",
    reviewedBy: log.reviewedBy ?? "",
    inclination: log.inclination ?? "",
    azimuth: log.azimuth ?? "",
    generalComments: log.generalComments ?? "",
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    deletedAt: log.deletedAt?.toISOString() ?? null,
  }
}

async function assertProjectForUser(userId: number, projectId: number) {
  const project = await projectRepo.findByIdForUser(projectId, userId)
  if (!project || project.deletedAt) {
    throw new ValidationError("Project not found")
  }
  return project
}

export async function list(filters: repo.LogListFilters) {
  await assertProjectForUser(filters.userId, filters.projectId)
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(userId: number, projectId: number, id: number) {
  await assertProjectForUser(userId, projectId)
  const log = await repo.findByIdForUser(id, userId, projectId)
  if (!log || log.deletedAt) throw new NotFoundError("Log not found")
  return toDTO(log)
}

export async function create(
  userId: number,
  projectId: number,
  input: Omit<repo.CreateLogInput, "userId" | "projectId">
) {
  await assertProjectForUser(userId, projectId)

  const duplicate = await repo.findByLogNumberForProject(projectId, input.logNumber)
  if (duplicate) {
    throw new ConflictError("A log with this log number already exists.")
  }

  if (input.proposedBorelogId) {
    const proposed = await repo.findByIdForUser(input.proposedBorelogId, userId, projectId)
    if (!proposed || proposed.deletedAt) {
      throw new ValidationError("Proposed borelog not found")
    }
  }

  const coordinateRequirement = await resolveCoordinateRequirementForUser(
    userId,
    input.logConfigId
  )
  assertCoordinatesForRequirement(coordinateRequirement, input.latitude, input.longitude)

  const log = await repo.create({
    ...input,
    userId,
    projectId,
    logType: toLogType(input.logType),
    logStatus: input.logStatus ? toLogStatus(input.logStatus) : undefined,
  })
  return toDTO(log)
}

export async function update(
  userId: number,
  projectId: number,
  id: number,
  input: repo.UpdateLogInput
) {
  await assertProjectForUser(userId, projectId)
  const existing = await repo.findByIdForUser(id, userId, projectId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Log not found")

  if (input.logNumber !== undefined) {
    const duplicate = await repo.findByLogNumberForProject(projectId, input.logNumber, id)
    if (duplicate) {
      throw new ConflictError("A log with this log number already exists.")
    }
  }

  if (input.proposedBorelogId) {
    const proposed = await repo.findByIdForUser(input.proposedBorelogId, userId, projectId)
    if (!proposed || proposed.deletedAt) {
      throw new ValidationError("Proposed borelog not found")
    }
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

  const updated = await repo.update(id, userId, projectId, {
    ...input,
    logType: input.logType ? toLogType(input.logType) : undefined,
    logStatus: input.logStatus ? toLogStatus(input.logStatus) : undefined,
  })
  return toDTO(updated)
}

export async function remove(userId: number, projectId: number, id: number) {
  await assertProjectForUser(userId, projectId)
  const existing = await repo.findByIdForUser(id, userId, projectId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Log not found")
  await repo.softDelete(id, userId, projectId)
  return { message: "Log removed" }
}
