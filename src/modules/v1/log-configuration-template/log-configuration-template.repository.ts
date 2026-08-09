import { prisma } from "../../../infrastructure/database/prisma"
import type { LogConfigurationTemplateDiscipline } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateLogConfigurationTemplateInput = {
  slug: string
  name: string
  description: string
  region: string
  disciplines: LogConfigurationTemplateDiscipline[]
  isAvailable?: boolean
  sortOrder?: number
}

export type UpdateLogConfigurationTemplateInput = Partial<CreateLogConfigurationTemplateInput>

export type LogConfigurationTemplateListFilters = {
  page: number
  limit: number
  includeDeleted?: boolean
  availableOnly?: boolean
  search?: string
  region?: string
  discipline?: LogConfigurationTemplateDiscipline
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function upsertDefault(data: CreateLogConfigurationTemplateInput) {
  return prisma.logConfigurationTemplate.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name.trim(),
      description: data.description.trim(),
      region: data.region.trim(),
      disciplines: data.disciplines,
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
    create: {
      slug: data.slug.trim(),
      name: data.name.trim(),
      description: data.description.trim(),
      region: data.region.trim(),
      disciplines: data.disciplines,
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function findBySlug(slug: string) {
  return prisma.logConfigurationTemplate.findFirst({
    where: { slug: slug.trim() },
  })
}

export async function findAll(filters: LogConfigurationTemplateListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = filters.includeDeleted ? {} : { deletedAt: null }
  const availableWhere = filters.availableOnly ? { isAvailable: true } : {}
  const regionWhere = filters.region ? { region: filters.region.trim() } : {}
  const disciplineWhere = filters.discipline ? { disciplines: { has: filters.discipline } } : {}
  const searchWhere = filters.search
    ? {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { description: { contains: filters.search, mode: "insensitive" as const } },
          { slug: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const where = {
    ...baseWhere,
    ...availableWhere,
    ...regionWhere,
    ...disciplineWhere,
    ...searchWhere,
  }

  const allowedSortFields = ["id", "slug", "name", "region", "sortOrder", "createdAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "sortOrder"
  const sortDir = filters.sortOrder ?? "asc"

  const [data, total] = await Promise.all([
    prisma.logConfigurationTemplate.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }, { id: "asc" }],
      skip,
      take,
    }),
    prisma.logConfigurationTemplate.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function findById(id: number) {
  return prisma.logConfigurationTemplate.findFirst({ where: { id } })
}

export async function create(data: CreateLogConfigurationTemplateInput) {
  return prisma.logConfigurationTemplate.create({
    data: {
      slug: data.slug.trim(),
      name: data.name.trim(),
      description: data.description.trim(),
      region: data.region.trim(),
      disciplines: data.disciplines,
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function update(id: number, data: UpdateLogConfigurationTemplateInput) {
  const payload: UpdateLogConfigurationTemplateInput = {}
  if (data.slug !== undefined) payload.slug = data.slug.trim()
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.description !== undefined) payload.description = data.description.trim()
  if (data.region !== undefined) payload.region = data.region.trim()
  if (data.disciplines !== undefined) payload.disciplines = data.disciplines
  if (data.isAvailable !== undefined) payload.isAvailable = data.isAvailable
  if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder

  return prisma.logConfigurationTemplate.update({ where: { id }, data: payload })
}

export async function softDelete(id: number) {
  return prisma.logConfigurationTemplate.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
