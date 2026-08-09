import type { Prisma, UserRole } from "../../../../generated/prisma/client"
import { prisma } from "../../../../infrastructure/database/prisma"
import { getSkipTake } from "../../../../shared/utils/pagination"
import type { CreateUserRecord, UpdateUserInput } from "./user.types"

const activeUserWhere: Prisma.UserWhereInput = { deletedAt: null }

export type UserListFilters = {
  page: number
  limit: number
  includeDeleted?: boolean
  search?: string
  role?: UserRole
  isEmailVerified?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function findById(id: number) {
  return prisma.user.findFirst({ where: { id, ...activeUserWhere } })
}

export async function findByEmail(email: string) {
  return prisma.user.findFirst({ where: { email, ...activeUserWhere } })
}

export async function findAll(filters: UserListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const baseWhere = filters.includeDeleted ? {} : { deletedAt: null }
  const roleWhere = filters.role ? { role: filters.role } : {}
  const verifiedWhere =
    filters.isEmailVerified === undefined ? {} : { isEmailVerified: filters.isEmailVerified }
  const searchWhere = filters.search
    ? {
        OR: [
          { firstName: { contains: filters.search, mode: "insensitive" as const } },
          { lastName: { contains: filters.search, mode: "insensitive" as const } },
          { email: { contains: filters.search, mode: "insensitive" as const } },
          { phoneNumber: { contains: filters.search, mode: "insensitive" as const } },
          { companyName: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const where = { ...baseWhere, ...roleWhere, ...verifiedWhere, ...searchWhere }

  const allowedSortFields = [
    "id",
    "firstName",
    "lastName",
    "email",
    "role",
    "isEmailVerified",
    "companyName",
    "createdAt",
    "updatedAt",
  ] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "id"
  const sortDir = filters.sortOrder ?? "desc"

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ [sortField]: sortDir }],
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ])

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function create(data: CreateUserRecord) {
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneCode: data.phoneCode,
      phoneNumber: data.phoneNumber,
      passwordHash: data.passwordHash,
      termsAndConditions: data.termsAndConditions,
      role: data.role ?? "user",
      isEmailVerified: data.isEmailVerified ?? false,
      companyName: data.companyName ?? null,
      companyLogoUrl: data.companyLogoUrl ?? null,
    },
  })
}

export async function update(id: number, data: UpdateUserInput, passwordHash?: string) {
  const updateData: Prisma.UserUpdateInput = {}
  if (data.firstName !== undefined) updateData.firstName = data.firstName
  if (data.lastName !== undefined) updateData.lastName = data.lastName
  if (data.email !== undefined) updateData.email = data.email
  if (data.phoneCode !== undefined) updateData.phoneCode = data.phoneCode
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber
  if (data.termsAndConditions !== undefined) updateData.termsAndConditions = data.termsAndConditions
  if (data.isEmailVerified !== undefined) updateData.isEmailVerified = data.isEmailVerified
  if (data.role !== undefined) updateData.role = data.role
  if (data.companyName !== undefined) updateData.companyName = data.companyName
  if (data.companyLogoUrl !== undefined) updateData.companyLogoUrl = data.companyLogoUrl
  if (passwordHash !== undefined) updateData.passwordHash = passwordHash
  return prisma.user.update({ where: { id }, data: updateData })
}

export async function softDelete(id: number) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
