import bcrypt from "bcrypt"
import type { UserRole } from "../../../generated/prisma/client"
import { BCRYPT_SALT_ROUNDS } from "../../../shared/constants"
import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as userRepository from "../user/users/user.repository"
import { toUserDTO } from "../user/users/user.mapper"
import type { CreateUserRecord, UpdateUserInput } from "../user/users/user.types"

export type CreateAdminUserInput = {
  firstName: string
  lastName: string
  email: string
  phoneCode?: string | null
  phoneNumber?: string | null
  password: string
  role?: UserRole
  isEmailVerified?: boolean
  termsAndConditions?: boolean
  companyName?: string | null
  companyLogoUrl?: string | null
}

export type UpdateAdminUserInput = {
  firstName?: string
  lastName?: string
  email?: string
  phoneCode?: string | null
  phoneNumber?: string | null
  password?: string
  role?: UserRole
  isEmailVerified?: boolean
  termsAndConditions?: boolean
  companyName?: string | null
  companyLogoUrl?: string | null
}

function normalizeOptionalText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const trimmed = value.trim()
  return trimmed || null
}

export async function list(filters: userRepository.UserListFilters) {
  const result = await userRepository.findAll(filters)
  return { ...result, data: result.data.map(toUserDTO) }
}

export async function getOne(id: number) {
  const user = await userRepository.findById(id)
  if (!user) throw new NotFoundError("User not found")
  return toUserDTO(user)
}

export async function create(input: CreateAdminUserInput) {
  const existing = await userRepository.findByEmail(input.email)
  if (existing) throw new ConflictError("A user with this email already exists.")

  const role = input.role ?? "user"
  const companyName = normalizeOptionalText(input.companyName) ?? null
  if (role === "user" && !companyName) {
    throw new ValidationError("Company name is required for regular users.")
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)
  const record: CreateUserRecord = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phoneCode: input.phoneCode?.trim() || null,
    phoneNumber: input.phoneNumber?.trim() || null,
    passwordHash,
    termsAndConditions: input.termsAndConditions ?? true,
    role,
    isEmailVerified: input.isEmailVerified ?? true,
    companyName,
    companyLogoUrl: normalizeOptionalText(input.companyLogoUrl) ?? null,
  }

  const user = await userRepository.create(record)
  return toUserDTO(user)
}

export async function update(id: number, input: UpdateAdminUserInput, actorUserId: number) {
  const existing = await userRepository.findById(id)
  if (!existing) throw new NotFoundError("User not found")

  if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
    const duplicate = await userRepository.findByEmail(input.email)
    if (duplicate && duplicate.id !== id) {
      throw new ConflictError("A user with this email already exists.")
    }
  }

  if (existing.role === "super_admin" && input.role === "user" && existing.id === actorUserId) {
    throw new ValidationError("You cannot demote your own super admin account.")
  }

  const nextRole = input.role ?? existing.role
  const nextCompanyName =
    input.companyName !== undefined
      ? normalizeOptionalText(input.companyName) ?? null
      : existing.companyName

  if (nextRole === "user" && !nextCompanyName) {
    throw new ValidationError("Company name is required for regular users.")
  }

  const updateInput: UpdateUserInput = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phoneCode: input.phoneCode === undefined ? undefined : input.phoneCode?.trim() || null,
    phoneNumber: input.phoneNumber === undefined ? undefined : input.phoneNumber?.trim() || null,
    role: input.role,
    isEmailVerified: input.isEmailVerified,
    termsAndConditions: input.termsAndConditions,
    companyName: input.companyName === undefined ? undefined : nextCompanyName,
    companyLogoUrl:
      input.companyLogoUrl === undefined
        ? undefined
        : normalizeOptionalText(input.companyLogoUrl) ?? null,
  }

  let passwordHash: string | undefined
  if (input.password) {
    passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)
  }

  const updated = await userRepository.update(id, updateInput, passwordHash)
  return toUserDTO(updated)
}

export async function remove(id: number, actorUserId: number) {
  const existing = await userRepository.findById(id)
  if (!existing) throw new NotFoundError("User not found")

  if (existing.id === actorUserId) {
    throw new ValidationError("You cannot delete your own account.")
  }

  await userRepository.softDelete(id)
  return { message: "User removed" }
}
