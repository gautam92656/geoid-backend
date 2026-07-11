import type { Prisma } from "../../../../generated/prisma/client"
import { prisma } from "../../../../infrastructure/database/prisma"
import type { CreateUserRecord, UpdateUserInput } from "./user.types"

const activeUserWhere: Prisma.UserWhereInput = { deletedAt: null }

export async function findById(id: number) {
  return prisma.user.findFirst({ where: { id, ...activeUserWhere } })
}

export async function findByEmail(email: string) {
  return prisma.user.findFirst({ where: { email, ...activeUserWhere } })
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
  if (passwordHash !== undefined) updateData.passwordHash = passwordHash
  return prisma.user.update({ where: { id }, data: updateData })
}

export async function softDelete(id: number) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
