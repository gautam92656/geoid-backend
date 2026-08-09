import { prisma } from "../../../infrastructure/database/prisma"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateOfficeInput = {
  userId: number
  name: string
  address?: string
  phone?: string
  externalId?: string
  officeNumber?: string
  state?: string
  laboratory?: string
}

export type UpdateOfficeInput = Partial<Omit<CreateOfficeInput, "userId">>

export type OfficeListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function findAll(filters: OfficeListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
  }
  const searchWhere = filters.search
    ? {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { address: { contains: filters.search, mode: "insensitive" as const } },
          { phone: { contains: filters.search, mode: "insensitive" as const } },
          { externalId: { contains: filters.search, mode: "insensitive" as const } },
          { officeNumber: { contains: filters.search, mode: "insensitive" as const } },
          { state: { contains: filters.search, mode: "insensitive" as const } },
          { laboratory: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const where = { ...baseWhere, ...searchWhere }

  const allowedSortFields = [
    "id",
    "name",
    "address",
    "phone",
    "state",
    "laboratory",
    "createdAt",
    "updatedAt",
  ] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "id"
  const sortDir = filters.sortOrder ?? "desc"

  const [data, total] = await Promise.all([
    prisma.office.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.office.count({ where }),
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
  return prisma.office.findFirst({ where: { id, userId } })
}

export async function findByNameForUser(userId: number, name: string, excludeId?: number) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null

  const offices = await prisma.office.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, name: true },
  })

  return offices.find((office) => office.name.trim().toLowerCase() === normalized) ?? null
}

export async function create(data: CreateOfficeInput) {
  return prisma.office.create({
    data: {
      userId: data.userId,
      name: data.name.trim(),
      address: data.address?.trim() || null,
      phone: data.phone?.trim() || null,
      externalId: data.externalId?.trim() || null,
      officeNumber: data.officeNumber?.trim() || null,
      state: data.state?.trim() || null,
      laboratory: data.laboratory?.trim() || null,
    },
  })
}

export async function update(id: number, userId: number, data: UpdateOfficeInput) {
  const payload: UpdateOfficeInput = {}
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.address !== undefined) payload.address = data.address.trim() || undefined
  if (data.phone !== undefined) payload.phone = data.phone.trim() || undefined
  if (data.externalId !== undefined) payload.externalId = data.externalId.trim() || undefined
  if (data.officeNumber !== undefined) payload.officeNumber = data.officeNumber.trim() || undefined
  if (data.state !== undefined) payload.state = data.state.trim() || undefined
  if (data.laboratory !== undefined) payload.laboratory = data.laboratory.trim() || undefined

  return prisma.office.update({
    where: { id, userId },
    data: {
      name: payload.name,
      address: payload.address === undefined ? undefined : payload.address || null,
      phone: payload.phone === undefined ? undefined : payload.phone || null,
      externalId: payload.externalId === undefined ? undefined : payload.externalId || null,
      officeNumber: payload.officeNumber === undefined ? undefined : payload.officeNumber || null,
      state: payload.state === undefined ? undefined : payload.state || null,
      laboratory: payload.laboratory === undefined ? undefined : payload.laboratory || null,
    },
  })
}

export async function softDelete(id: number, userId: number) {
  return prisma.office.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}
