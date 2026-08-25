import { prisma } from "../../../infrastructure/database/prisma"
import type { ProjectStatus } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateProjectInput = {
  userId: number
  projectNo: string
  name: string
  address?: string
  status?: ProjectStatus
  brief?: string
  assignee?: string
  logConfigId?: string
  clientId?: number
  office?: string
  startDate?: string
  endDate?: string
  coordinateSystem?: string
  latitude?: string
  longitude?: string
  easting?: string
  northing?: string
  utmZone?: string
}

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, "userId">>

export type ProjectListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  listScope?: "active" | "archived" | "deleted"
  search?: string
  status?: ProjectStatus
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

function buildVisibilityWhere(filters: ProjectListFilters) {
  if (filters.listScope === "archived") {
    return { deletedAt: null, archivedAt: { not: null } }
  }

  if (filters.listScope === "deleted") {
    return { deletedAt: { not: null } }
  }

  if (filters.listScope === "active") {
    return { deletedAt: null, archivedAt: null }
  }

  return filters.includeDeleted ? {} : { deletedAt: null }
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

export async function findAll(filters: ProjectListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...buildVisibilityWhere(filters),
  }
  const statusWhere = filters.status ? { status: filters.status } : {}
  const searchWhere = filters.search
    ? {
        OR: [
          { projectNo: { contains: filters.search, mode: "insensitive" as const } },
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { address: { contains: filters.search, mode: "insensitive" as const } },
          { assignee: { contains: filters.search, mode: "insensitive" as const } },
          { brief: { contains: filters.search, mode: "insensitive" as const } },
          { office: { contains: filters.search, mode: "insensitive" as const } },
          { client: { companyName: { contains: filters.search, mode: "insensitive" as const } } },
        ],
      }
    : {}

  const where = { ...baseWhere, ...statusWhere, ...searchWhere }

  const allowedSortFields = ["id", "projectNo", "name", "status", "createdAt", "updatedAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "id"
  const sortDir = filters.sortOrder ?? "desc"

  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { client: { select: { id: true, companyName: true } } },
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.project.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function findByIdForUser(id: number, userId: number) {
  return prisma.project.findFirst({
    where: { id, userId },
    include: { client: { select: { id: true, companyName: true } } },
  })
}

export async function findFullByProjectNoForUser(userId: number, projectNo: string) {
  const trimmed = projectNo.trim()
  if (!trimmed) return null

  const projects = await prisma.project.findMany({
    where: {
      userId,
      deletedAt: null,
      projectNo: { equals: trimmed, mode: "insensitive" },
    },
    include: { client: { select: { id: true, companyName: true } } },
    take: 1,
  })

  return projects[0] ?? null
}

export async function findByProjectNoForUser(
  userId: number,
  projectNo: string,
  excludeId?: number
) {
  const normalized = projectNo.trim().toLowerCase()
  if (!normalized) return null

  const projects = await prisma.project.findMany({
    where: {
      userId,
      deletedAt: null,
      archivedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, projectNo: true },
  })

  return projects.find((project) => project.projectNo.trim().toLowerCase() === normalized) ?? null
}

/** Includes archived/deleted rows — used when avoiding @@unique([userId, projectNo]) collisions. */
export async function findAnyByProjectNoForUser(userId: number, projectNo: string) {
  const normalized = projectNo.trim().toLowerCase()
  if (!normalized) return null

  const projects = await prisma.project.findMany({
    where: { userId },
    select: { id: true, projectNo: true },
  })

  return projects.find((project) => project.projectNo.trim().toLowerCase() === normalized) ?? null
}

export async function create(data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      userId: data.userId,
      projectNo: data.projectNo.trim(),
      name: data.name.trim(),
      address: data.address?.trim() || null,
      status: data.status ?? "to_do",
      brief: data.brief?.trim() || null,
      assignee: data.assignee?.trim() || null,
      logConfigId: data.logConfigId?.trim() || null,
      clientId: data.clientId ?? null,
      office: data.office?.trim() || null,
      startDate: parseDate(data.startDate),
      endDate: parseDate(data.endDate),
      coordinateSystem: data.coordinateSystem?.trim() || null,
      latitude: data.latitude?.trim() || null,
      longitude: data.longitude?.trim() || null,
      easting: data.easting?.trim() || null,
      northing: data.northing?.trim() || null,
      utmZone: data.utmZone?.trim() || null,
    },
    include: { client: { select: { id: true, companyName: true } } },
  })
}

export async function update(id: number, userId: number, data: UpdateProjectInput) {
  const payload: Record<string, unknown> = {}
  if (data.projectNo !== undefined) payload.projectNo = data.projectNo.trim()
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.address !== undefined) payload.address = data.address.trim() || null
  if (data.status !== undefined) payload.status = data.status
  if (data.brief !== undefined) payload.brief = data.brief.trim() || null
  if (data.assignee !== undefined) payload.assignee = data.assignee.trim() || null
  if (data.logConfigId !== undefined) payload.logConfigId = data.logConfigId.trim() || null
  if (data.clientId !== undefined) payload.clientId = data.clientId
  if (data.office !== undefined) payload.office = data.office.trim() || null
  if (data.startDate !== undefined) payload.startDate = parseDate(data.startDate)
  if (data.endDate !== undefined) payload.endDate = parseDate(data.endDate)
  if (data.coordinateSystem !== undefined) {
    payload.coordinateSystem = data.coordinateSystem.trim() || null
  }
  if (data.latitude !== undefined) payload.latitude = data.latitude.trim() || null
  if (data.longitude !== undefined) payload.longitude = data.longitude.trim() || null
  if (data.easting !== undefined) payload.easting = data.easting.trim() || null
  if (data.northing !== undefined) payload.northing = data.northing.trim() || null
  if (data.utmZone !== undefined) payload.utmZone = data.utmZone.trim() || null

  return prisma.project.update({
    where: { id, userId },
    data: payload,
    include: { client: { select: { id: true, companyName: true } } },
  })
}

export async function softDelete(id: number, userId: number) {
  return prisma.project.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}

export async function archive(id: number, userId: number) {
  return prisma.project.update({
    where: { id, userId },
    data: { archivedAt: new Date() },
  })
}
