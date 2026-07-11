import { prisma } from "../../../infrastructure/database/prisma"
import { getSkipTake } from "../../../shared/utils/pagination"

export type CreateFaqInput = {
  question: string
  answer: string
  sortOrder?: number
  isActive?: boolean
}

export type UpdateFaqInput = Partial<CreateFaqInput>

export type FaqListFilters = {
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function findAll(filters: FaqListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = filters.includeDeleted ? {} : { deletedAt: null }
  const where = filters.search
    ? {
        ...baseWhere,
        OR: [
          { question: { contains: filters.search, mode: "insensitive" as const } },
          { answer: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : baseWhere

  const allowedSortFields = ["id", "question", "answer", "isActive", "createdAt"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "id"
  const sortDir = filters.sortOrder ?? "asc"

  const [data, total] = await Promise.all([
    prisma.faq.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.faq.count({ where }),
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
  return prisma.faq.findFirst({ where: { id } })
}

export async function create(data: CreateFaqInput) {
  return prisma.faq.create({
    data: {
      question: data.question.trim(),
      answer: data.answer.trim(),
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  })
}

export async function update(id: number, data: UpdateFaqInput) {
  const payload: UpdateFaqInput = {}
  if (data.question !== undefined) payload.question = data.question.trim()
  if (data.answer !== undefined) payload.answer = data.answer.trim()
  if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder
  if (data.isActive !== undefined) payload.isActive = data.isActive
  return prisma.faq.update({ where: { id }, data: payload })
}

export async function softDelete(id: number) {
  return prisma.faq.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
