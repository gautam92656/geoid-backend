import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateEquipmentInput = {
  userId: number
  equipmentTypeId: number
  equipmentNo?: string
  equipmentName?: string
  suppliers?: string[]
  mounting?: string
  driveWeight?: string
  drop?: string
  manufacturer?: string
  model?: string
  energyTransferRatio?: string
  hammerEfficiencyCorrection?: string
  netAreaRatio?: string
  tipArea?: string
  frictionRatio?: string
  porePressureTransducerLocation?: string
  frictionReducerType?: string
  frictionReducer?: string
  calibratedBy?: string
  dateOfCalibration?: string | null
  bucketWidth?: string
}

export type UpdateEquipmentInput = Partial<Omit<CreateEquipmentInput, "userId">>

export type EquipmentListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  equipmentTypeId?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

function parseDate(value?: string | null): Date | null {
  if (!value?.trim()) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeOptionalString(value?: string): string | null {
  if (value === undefined) return undefined as never
  const trimmed = value.trim()
  return trimmed || null
}

function buildEquipmentData(
  data: CreateEquipmentInput | UpdateEquipmentInput,
  includeUser = false
): Prisma.EquipmentCreateInput | Prisma.EquipmentUpdateInput {
  const payload: Record<string, unknown> = {}

  if ("userId" in data && data.userId !== undefined) {
    payload.user = { connect: { id: data.userId } }
  }
  if (data.equipmentTypeId !== undefined) {
    payload.equipmentType = { connect: { id: data.equipmentTypeId } }
  }
  if (data.equipmentNo !== undefined) payload.equipmentNo = normalizeOptionalString(data.equipmentNo)
  if (data.equipmentName !== undefined) payload.equipmentName = normalizeOptionalString(data.equipmentName)
  if (data.suppliers !== undefined) payload.suppliers = data.suppliers
  if (data.mounting !== undefined) payload.mounting = normalizeOptionalString(data.mounting)
  if (data.driveWeight !== undefined) payload.driveWeight = normalizeOptionalString(data.driveWeight)
  if (data.drop !== undefined) payload.drop = normalizeOptionalString(data.drop)
  if (data.manufacturer !== undefined) payload.manufacturer = normalizeOptionalString(data.manufacturer)
  if (data.model !== undefined) payload.model = normalizeOptionalString(data.model)
  if (data.energyTransferRatio !== undefined) {
    payload.energyTransferRatio = normalizeOptionalString(data.energyTransferRatio)
  }
  if (data.hammerEfficiencyCorrection !== undefined) {
    payload.hammerEfficiencyCorrection = normalizeOptionalString(data.hammerEfficiencyCorrection)
  }
  if (data.netAreaRatio !== undefined) payload.netAreaRatio = normalizeOptionalString(data.netAreaRatio)
  if (data.tipArea !== undefined) payload.tipArea = normalizeOptionalString(data.tipArea)
  if (data.frictionRatio !== undefined) payload.frictionRatio = normalizeOptionalString(data.frictionRatio)
  if (data.porePressureTransducerLocation !== undefined) {
    payload.porePressureTransducerLocation = normalizeOptionalString(data.porePressureTransducerLocation)
  }
  if (data.frictionReducerType !== undefined) {
    payload.frictionReducerType = normalizeOptionalString(data.frictionReducerType)
  }
  if (data.frictionReducer !== undefined) {
    payload.frictionReducer = normalizeOptionalString(data.frictionReducer)
  }
  if (data.calibratedBy !== undefined) payload.calibratedBy = normalizeOptionalString(data.calibratedBy)
  if (data.dateOfCalibration !== undefined) {
    payload.dateOfCalibration = parseDate(data.dateOfCalibration)
  }
  if (data.bucketWidth !== undefined) payload.bucketWidth = normalizeOptionalString(data.bucketWidth)

  return payload as Prisma.EquipmentCreateInput | Prisma.EquipmentUpdateInput
}

const equipmentInclude = {
  equipmentType: {
    select: { id: true, name: true },
  },
} as const

export async function findAll(filters: EquipmentListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
  }
  const typeWhere = filters.equipmentTypeId ? { equipmentTypeId: filters.equipmentTypeId } : {}
  const searchWhere = filters.search
    ? {
        OR: [
          { equipmentNo: { contains: filters.search, mode: "insensitive" as const } },
          { equipmentName: { contains: filters.search, mode: "insensitive" as const } },
          { manufacturer: { contains: filters.search, mode: "insensitive" as const } },
          { model: { contains: filters.search, mode: "insensitive" as const } },
          { equipmentType: { name: { contains: filters.search, mode: "insensitive" as const } } },
        ],
      }
    : {}

  const where = { ...baseWhere, ...typeWhere, ...searchWhere }

  const allowedSortFields = ["id", "equipmentNo", "equipmentName", "createdAt", "updatedAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "id"
  const sortDir = filters.sortOrder ?? "desc"

  const [data, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      include: equipmentInclude,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.equipment.count({ where }),
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
  return prisma.equipment.findFirst({
    where: { id, userId },
    include: equipmentInclude,
  })
}

export async function findEquipmentTypeForUser(equipmentTypeId: number, userId: number) {
  return prisma.equipmentType.findFirst({
    where: { id: equipmentTypeId, userId, deletedAt: null },
  })
}

export async function create(data: CreateEquipmentInput) {
  return prisma.equipment.create({
    data: buildEquipmentData(data, true) as Prisma.EquipmentCreateInput,
    include: equipmentInclude,
  })
}

export async function update(id: number, data: UpdateEquipmentInput) {
  return prisma.equipment.update({
    where: { id },
    data: buildEquipmentData(data) as Prisma.EquipmentUpdateInput,
    include: equipmentInclude,
  })
}

export async function softDelete(id: number) {
  return prisma.equipment.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
