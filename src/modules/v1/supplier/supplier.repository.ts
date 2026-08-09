import { prisma } from "../../../infrastructure/database/prisma"
import type { SupplierRelationship, SupplierStatus, SupplierType } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateSupplierInput = {
  userId: number
  businessName: string
  supplierType: SupplierType
  supplierRelationship?: SupplierRelationship
  supplierExternalId?: string
  labTestTypes?: string[]
  firstName?: string
  lastName?: string
  address?: string
  email?: string
  phone?: string
  abn?: string
  status?: SupplierStatus
}

export type UpdateSupplierInput = Partial<Omit<CreateSupplierInput, "userId">>

export type SupplierListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  status?: SupplierStatus
  supplierType?: SupplierType
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function findAll(filters: SupplierListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
  }
  const statusWhere = filters.status ? { status: filters.status } : {}
  const typeWhere = filters.supplierType ? { supplierType: filters.supplierType } : {}
  const searchWhere = filters.search
    ? {
        OR: [
          { businessName: { contains: filters.search, mode: "insensitive" as const } },
          { firstName: { contains: filters.search, mode: "insensitive" as const } },
          { lastName: { contains: filters.search, mode: "insensitive" as const } },
          { email: { contains: filters.search, mode: "insensitive" as const } },
          { phone: { contains: filters.search, mode: "insensitive" as const } },
          { supplierExternalId: { contains: filters.search, mode: "insensitive" as const } },
          { abn: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const where = { ...baseWhere, ...statusWhere, ...typeWhere, ...searchWhere }

  const allowedSortFields = [
    "id",
    "businessName",
    "supplierType",
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
    prisma.supplier.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.supplier.count({ where }),
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
  return prisma.supplier.findFirst({ where: { id, userId } })
}

export async function findByBusinessNameForUser(
  userId: number,
  businessName: string,
  excludeId?: number
) {
  const normalized = businessName.trim().toLowerCase()
  if (!normalized) return null

  const suppliers = await prisma.supplier.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, businessName: true },
  })

  return (
    suppliers.find((supplier) => supplier.businessName.trim().toLowerCase() === normalized) ?? null
  )
}

export async function findByEmailForUser(userId: number, email: string, excludeId?: number) {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null

  const suppliers = await prisma.supplier.findMany({
    where: {
      userId,
      deletedAt: null,
      email: { not: null },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, email: true },
  })

  return (
    suppliers.find((supplier) => (supplier.email ?? "").trim().toLowerCase() === normalized) ?? null
  )
}

export async function create(data: CreateSupplierInput) {
  return prisma.supplier.create({
    data: {
      userId: data.userId,
      businessName: data.businessName.trim(),
      supplierType: data.supplierType,
      supplierRelationship: data.supplierRelationship ?? null,
      supplierExternalId: data.supplierExternalId?.trim() || null,
      labTestTypes: data.labTestTypes ?? [],
      firstName: data.firstName?.trim() || null,
      lastName: data.lastName?.trim() || null,
      address: data.address?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      abn: data.abn?.trim() || null,
      status: data.status ?? "active",
    },
  })
}

export async function update(id: number, userId: number, data: UpdateSupplierInput) {
  const payload: Record<string, unknown> = {}
  if (data.businessName !== undefined) payload.businessName = data.businessName.trim()
  if (data.supplierType !== undefined) payload.supplierType = data.supplierType
  if (data.supplierRelationship !== undefined) {
    payload.supplierRelationship = data.supplierRelationship || null
  }
  if (data.supplierExternalId !== undefined) {
    payload.supplierExternalId = data.supplierExternalId.trim() || null
  }
  if (data.labTestTypes !== undefined) payload.labTestTypes = data.labTestTypes
  if (data.firstName !== undefined) payload.firstName = data.firstName.trim() || null
  if (data.lastName !== undefined) payload.lastName = data.lastName.trim() || null
  if (data.address !== undefined) payload.address = data.address.trim() || null
  if (data.email !== undefined) payload.email = data.email.trim() || null
  if (data.phone !== undefined) payload.phone = data.phone.trim() || null
  if (data.abn !== undefined) payload.abn = data.abn.trim() || null
  if (data.status !== undefined) payload.status = data.status

  return prisma.supplier.update({ where: { id, userId }, data: payload })
}

export async function softDelete(id: number, userId: number) {
  return prisma.supplier.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}
