import type { Request } from "express"
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from "../constants"
import type { PaginationParams } from "../types"

function toStr(v: unknown): string {
  return Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "")
}

export function parsePaginationParams(query: Request["query"]): PaginationParams {
  const page = Math.max(1, parseInt(toStr(query.page), 10) || DEFAULT_PAGE)
  let limit = parseInt(toStr(query.limit), 10) || DEFAULT_LIMIT
  limit = Math.min(Math.max(1, limit), MAX_LIMIT)
  return { page, limit }
}

export function getSkipTake(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}

export interface PaginateResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function paginate<T>(
  // Prisma delegate - using `unknown` to avoid strict delegate typing
  model: { findMany: (args: unknown) => Promise<unknown[]>; count: (args?: unknown) => Promise<number> },
  queryOptions: Record<string, unknown> = {},
  { page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}
): Promise<PaginateResult<T>> {
  const skip = (page - 1) * pageSize
  const take = pageSize
  const where = queryOptions.where

  const [data, total] = await Promise.all([
    model.findMany({ ...queryOptions, skip, take }),
    model.count(where ? { where } : undefined),
  ])

  return {
    data: data as T[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
