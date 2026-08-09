import { prisma } from "../../../infrastructure/database/prisma"
import type { ClientStatus } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateClientInput = {
  userId: number
  companyName: string
  companyContact?: string
  email?: string
  phone?: string
  externalId?: string
  status?: ClientStatus
}

export type UpdateClientInput = Partial<Omit<CreateClientInput, "userId">>

export type ClientListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  status?: ClientStatus
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function findAll(filters: ClientListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
  }
  const statusWhere = filters.status ? { status: filters.status } : {}
  const searchWhere = filters.search
    ? {
        OR: [
          { companyName: { contains: filters.search, mode: "insensitive" as const } },
          { companyContact: { contains: filters.search, mode: "insensitive" as const } },
          { email: { contains: filters.search, mode: "insensitive" as const } },
          { phone: { contains: filters.search, mode: "insensitive" as const } },
          { externalId: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const where = { ...baseWhere, ...statusWhere, ...searchWhere }

  const allowedSortFields = [
    "id",
    "companyName",
    "companyContact",
    "email",
    "status",
    "createdAt",
    "updatedAt",
  ] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "id"
  const sortDir = filters.sortOrder ?? "desc"

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.client.count({ where }),
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
  return prisma.client.findFirst({ where: { id, userId } })
}

export async function findByCompanyNameForUser(
  userId: number,
  companyName: string,
  excludeId?: number
) {
  const normalized = companyName.trim().toLowerCase()
  if (!normalized) return null

  const clients = await prisma.client.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, companyName: true },
  })

  return clients.find((client) => client.companyName.trim().toLowerCase() === normalized) ?? null
}

export async function findByEmailForUser(userId: number, email: string, excludeId?: number) {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null

  const clients = await prisma.client.findMany({
    where: {
      userId,
      deletedAt: null,
      email: { not: null },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, email: true },
  })

  return (
    clients.find((client) => (client.email ?? "").trim().toLowerCase() === normalized) ?? null
  )
}

export async function create(data: CreateClientInput) {
  return prisma.client.create({
    data: {
      userId: data.userId,
      companyName: data.companyName.trim(),
      companyContact: data.companyContact?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      externalId: data.externalId?.trim() || null,
      status: data.status ?? "active",
    },
  })
}

export async function update(id: number, userId: number, data: UpdateClientInput) {
  const payload: UpdateClientInput = {}
  if (data.companyName !== undefined) payload.companyName = data.companyName.trim()
  if (data.companyContact !== undefined) payload.companyContact = data.companyContact.trim() || undefined
  if (data.email !== undefined) payload.email = data.email.trim() || undefined
  if (data.phone !== undefined) payload.phone = data.phone.trim() || undefined
  if (data.externalId !== undefined) payload.externalId = data.externalId.trim() || undefined
  if (data.status !== undefined) payload.status = data.status

  return prisma.client.update({
    where: { id, userId },
    data: {
      companyName: payload.companyName,
      companyContact: payload.companyContact === undefined ? undefined : payload.companyContact || null,
      email: payload.email === undefined ? undefined : payload.email || null,
      phone: payload.phone === undefined ? undefined : payload.phone || null,
      externalId: payload.externalId === undefined ? undefined : payload.externalId || null,
      status: payload.status,
    },
  })
}

export async function softDelete(id: number, userId: number) {
  return prisma.client.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}
