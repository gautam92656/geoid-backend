import type { UserRole } from "../../../../shared/constants"

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  phoneCode?: string | null
  phoneNumber?: string | null
  password: string
  termsAndConditions: boolean
  role?: UserRole
  companyName?: string | null
  companyLogoUrl?: string | null
}

export interface CreateUserRecord {
  firstName: string
  lastName: string
  email: string
  phoneCode: string | null
  phoneNumber: string | null
  passwordHash: string
  termsAndConditions: boolean
  role?: UserRole
  isEmailVerified?: boolean
  companyName?: string | null
  companyLogoUrl?: string | null
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  phoneCode?: string | null
  phoneNumber?: string | null
  password?: string
  termsAndConditions?: boolean
  isEmailVerified?: boolean
  role?: UserRole
  companyName?: string | null
  companyLogoUrl?: string | null
}

export interface UserDTO {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneCode: string | null
  phoneNumber: string | null
  termsAndConditions: boolean
  isEmailVerified: boolean
  role: UserRole
  companyName: string | null
  companyLogoUrl: string | null
  createdAt: string
  updatedAt: string
}
