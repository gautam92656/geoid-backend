import type { HeaderFooterReportType, HeaderFooterTemplateKind, Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../../infrastructure/database/prisma"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateHeaderFooterTemplateInput = {
  userId: number
  name: string
  kind: HeaderFooterTemplateKind
  reportType?: HeaderFooterReportType | null
  content?: Prisma.InputJsonValue
}

export type UpdateHeaderFooterTemplateInput = {
  name?: string
  kind?: HeaderFooterTemplateKind
  reportType?: HeaderFooterReportType | null
  content?: Prisma.InputJsonValue
}

export type HeaderFooterTemplateListFilters = {
  userId: number
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  kind?: HeaderFooterTemplateKind
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function findAll(filters: HeaderFooterTemplateListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = {
    userId: filters.userId,
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
    ...(filters.kind ? { kind: filters.kind } : {}),
  }
  const searchWhere = filters.search
    ? {
        name: { contains: filters.search, mode: "insensitive" as const },
      }
    : {}

  const where = { ...baseWhere, ...searchWhere }

  const allowedSortFields = ["id", "name", "kind", "reportType", "createdAt", "updatedAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "updatedAt"
  const sortDir = filters.sortOrder ?? "desc"

  const [data, total] = await Promise.all([
    prisma.headerFooterTemplate.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.headerFooterTemplate.count({ where }),
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
  return prisma.headerFooterTemplate.findFirst({ where: { id, userId } })
}

export async function findByNameKindForUser(
  userId: number,
  name: string,
  kind: HeaderFooterTemplateKind,
  excludeId?: number
) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null

  const templates = await prisma.headerFooterTemplate.findMany({
    where: {
      userId,
      kind,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, name: true },
  })

  return templates.find((template) => template.name.trim().toLowerCase() === normalized) ?? null
}

export async function create(data: CreateHeaderFooterTemplateInput) {
  return prisma.headerFooterTemplate.create({
    data: {
      userId: data.userId,
      name: data.name.trim(),
      kind: data.kind,
      reportType: data.reportType ?? null,
      content: data.content ?? {},
    },
  })
}

export async function update(id: number, userId: number, data: UpdateHeaderFooterTemplateInput) {
  return prisma.headerFooterTemplate.update({
    where: { id, userId },
    data: {
      name: data.name === undefined ? undefined : data.name.trim(),
      kind: data.kind,
      reportType: data.reportType === undefined ? undefined : data.reportType,
      content: data.content,
    },
  })
}

export async function softDelete(id: number, userId: number) {
  return prisma.headerFooterTemplate.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}
