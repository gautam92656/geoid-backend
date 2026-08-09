import { prisma } from "../../../infrastructure/database/prisma"
import type { LogStatus, LogType } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogInput = {
  userId: number
  projectId: number
  proposedBorelogId?: number | null
  logNumber: string
  logConfigId: string
  logType: LogType
  logStatus?: LogStatus
  drillingDate?: string
  drillingTime?: string
  finishLogDate?: string
  finishLogTime?: string
  endDepth?: string
  finishingReason?: string
  finishingComment?: string
  coordinateSystem?: string
  latitude?: string
  longitude?: string
  easting?: string
  northing?: string
  utmZone?: string
  elevation?: string
  station?: string
  locationComment?: string
  supplierId?: number | null
  equipmentId?: number | null
  loggedBy?: string
  reviewedBy?: string
  inclination?: string
  azimuth?: string
  generalComments?: string
}

export type UpdateLogInput = Partial<Omit<CreateLogInput, "userId" | "projectId">>

export type LogListFilters = {
  userId: number
  projectId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  status?: LogStatus
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

function parseDate(value?: string | null): Date | null {
  if (value == null) return null

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T00:00:00.000Z`)
    : new Date(trimmed)

  return Number.isNaN(date.getTime()) ? null : date
}

function trimOrNull(value?: string | null): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed || null
}

export async function findAll(filters: LogListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    projectId: filters.projectId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
  }
  const statusWhere = filters.status ? { logStatus: filters.status } : {}
  const searchWhere = filters.search
    ? {
        OR: [
          { logNumber: { contains: filters.search, mode: "insensitive" as const } },
          { locationComment: { contains: filters.search, mode: "insensitive" as const } },
          { generalComments: { contains: filters.search, mode: "insensitive" as const } },
          { loggedBy: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const where = { ...baseWhere, ...statusWhere, ...searchWhere }

  const allowedSortFields = ["id", "logNumber", "logType", "logStatus", "createdAt", "updatedAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "id"
  const sortDir = filters.sortOrder ?? "desc"

  const [data, total] = await Promise.all([
    prisma.log.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.log.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function findByIdForUser(id: number, userId: number, projectId: number) {
  return prisma.log.findFirst({
    where: { id, userId, projectId },
  })
}

export async function findByLogNumberForProject(
  projectId: number,
  logNumber: string,
  excludeId?: number
) {
  const normalized = logNumber.trim().toLowerCase()
  if (!normalized) return null

  const logs = await prisma.log.findMany({
    where: {
      projectId,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, logNumber: true },
  })

  return logs.find((log) => log.logNumber.trim().toLowerCase() === normalized) ?? null
}

export async function create(data: CreateLogInput) {
  return prisma.log.create({
    data: {
      userId: data.userId,
      projectId: data.projectId,
      proposedBorelogId: data.proposedBorelogId ?? null,
      logNumber: data.logNumber.trim(),
      logConfigId: data.logConfigId.trim(),
      logType: data.logType,
      logStatus: data.logStatus ?? "to_do",
      drillingDate: parseDate(data.drillingDate),
      drillingTime: trimOrNull(data.drillingTime),
      finishLogDate: parseDate(data.finishLogDate),
      finishLogTime: trimOrNull(data.finishLogTime),
      endDepth: trimOrNull(data.endDepth),
      finishingReason: trimOrNull(data.finishingReason),
      finishingComment: trimOrNull(data.finishingComment),
      coordinateSystem: trimOrNull(data.coordinateSystem),
      latitude: trimOrNull(data.latitude),
      longitude: trimOrNull(data.longitude),
      easting: trimOrNull(data.easting),
      northing: trimOrNull(data.northing),
      utmZone: trimOrNull(data.utmZone),
      elevation: trimOrNull(data.elevation),
      station: trimOrNull(data.station),
      locationComment: trimOrNull(data.locationComment),
      supplierId: data.supplierId ?? null,
      equipmentId: data.equipmentId ?? null,
      loggedBy: trimOrNull(data.loggedBy),
      reviewedBy: trimOrNull(data.reviewedBy),
      inclination: trimOrNull(data.inclination),
      azimuth: trimOrNull(data.azimuth),
      generalComments: trimOrNull(data.generalComments),
    },
  })
}

export async function update(
  id: number,
  userId: number,
  projectId: number,
  data: UpdateLogInput
) {
  const payload: Record<string, unknown> = {}
  if (data.proposedBorelogId !== undefined) payload.proposedBorelogId = data.proposedBorelogId
  if (data.logNumber !== undefined) payload.logNumber = data.logNumber.trim()
  if (data.logConfigId !== undefined) payload.logConfigId = data.logConfigId.trim() || null
  if (data.logType !== undefined) payload.logType = data.logType
  if (data.logStatus !== undefined) payload.logStatus = data.logStatus
  if (data.drillingDate !== undefined) payload.drillingDate = parseDate(data.drillingDate)
  if (data.drillingTime !== undefined) payload.drillingTime = trimOrNull(data.drillingTime)
  if (data.finishLogDate !== undefined) payload.finishLogDate = parseDate(data.finishLogDate)
  if (data.finishLogTime !== undefined) payload.finishLogTime = trimOrNull(data.finishLogTime)
  if (data.endDepth !== undefined) payload.endDepth = trimOrNull(data.endDepth)
  if (data.finishingReason !== undefined) payload.finishingReason = trimOrNull(data.finishingReason)
  if (data.finishingComment !== undefined) payload.finishingComment = trimOrNull(data.finishingComment)
  if (data.coordinateSystem !== undefined) {
    payload.coordinateSystem = trimOrNull(data.coordinateSystem)
  }
  if (data.latitude !== undefined) payload.latitude = trimOrNull(data.latitude)
  if (data.longitude !== undefined) payload.longitude = trimOrNull(data.longitude)
  if (data.easting !== undefined) payload.easting = trimOrNull(data.easting)
  if (data.northing !== undefined) payload.northing = trimOrNull(data.northing)
  if (data.utmZone !== undefined) payload.utmZone = trimOrNull(data.utmZone)
  if (data.elevation !== undefined) payload.elevation = trimOrNull(data.elevation)
  if (data.station !== undefined) payload.station = trimOrNull(data.station)
  if (data.locationComment !== undefined) payload.locationComment = trimOrNull(data.locationComment)
  if (data.supplierId !== undefined) payload.supplierId = data.supplierId
  if (data.equipmentId !== undefined) payload.equipmentId = data.equipmentId
  if (data.loggedBy !== undefined) payload.loggedBy = trimOrNull(data.loggedBy)
  if (data.reviewedBy !== undefined) payload.reviewedBy = trimOrNull(data.reviewedBy)
  if (data.inclination !== undefined) payload.inclination = trimOrNull(data.inclination)
  if (data.azimuth !== undefined) payload.azimuth = trimOrNull(data.azimuth)
  if (data.generalComments !== undefined) payload.generalComments = trimOrNull(data.generalComments)

  return prisma.log.update({
    where: { id, userId, projectId },
    data: payload,
  })
}

export async function softDelete(id: number, userId: number, projectId: number) {
  return prisma.log.update({
    where: { id, userId, projectId },
    data: { deletedAt: new Date() },
  })
}
