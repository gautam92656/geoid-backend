import { prisma } from "../../../infrastructure/database/prisma"
import type { EquipmentTypeStatus, Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type EquipmentFieldConfig = Record<string, boolean>

export type CreateEquipmentTypeInput = {
  userId: number
  name: string
  description?: string
  status?: EquipmentTypeStatus
  fieldConfig?: EquipmentFieldConfig
}

export type UpdateEquipmentTypeInput = {
  name?: string
  description?: string
  status?: EquipmentTypeStatus
  fieldConfig?: EquipmentFieldConfig
}

export type EquipmentTypeListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  status?: EquipmentTypeStatus
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function countForUser(userId: number) {
  return prisma.equipmentType.count({
    where: { userId, deletedAt: null },
  })
}

export async function createManyForUser(
  userId: number,
  types: Array<{ name: string; isDefault: boolean; fieldConfig: EquipmentFieldConfig }>
) {
  return prisma.equipmentType.createMany({
    data: types.map((type) => ({
      userId,
      name: type.name,
      isDefault: type.isDefault,
      fieldConfig: type.fieldConfig,
    })),
  })
}

export async function findAll(filters: EquipmentTypeListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
  }
  const statusWhere = filters.status ? { status: filters.status } : {}
  const searchWhere = filters.search
    ? {
        name: { contains: filters.search, mode: "insensitive" as const },
      }
    : {}

  const where = { ...baseWhere, ...statusWhere, ...searchWhere }

  const allowedSortFields = ["id", "name", "status", "createdAt", "updatedAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "name"
  const sortDir = filters.sortOrder ?? "asc"

  const [data, total] = await Promise.all([
    prisma.equipmentType.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.equipmentType.count({ where }),
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
  return prisma.equipmentType.findFirst({
    where: { id, userId },
  })
}

export async function findByNameForUser(userId: number, name: string, excludeId?: number) {
  const normalized = name.trim().toLowerCase()
  const types = await prisma.equipmentType.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, name: true },
  })

  return types.find((type) => type.name.trim().toLowerCase() === normalized) ?? null
}

export async function create(data: CreateEquipmentTypeInput) {
  return prisma.equipmentType.create({
    data: {
      userId: data.userId,
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      status: data.status ?? "active",
      isDefault: false,
      fieldConfig: (data.fieldConfig ?? {}) as Prisma.InputJsonValue,
    },
  })
}

export async function update(id: number, data: UpdateEquipmentTypeInput) {
  const payload: Prisma.EquipmentTypeUpdateInput = {}

  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.description !== undefined) payload.description = data.description.trim()
  if (data.status !== undefined) payload.status = data.status
  if (data.fieldConfig !== undefined) payload.fieldConfig = data.fieldConfig as Prisma.InputJsonValue

  return prisma.equipmentType.update({
    where: { id },
    data: payload,
  })
}

export async function softDelete(id: number) {
  return prisma.equipmentType.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function listFieldDefinitions() {
  return prisma.equipmentFieldDefinition.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}
