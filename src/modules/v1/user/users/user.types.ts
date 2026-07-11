export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  phoneCode?: string | null
  phoneNumber?: string | null
  password: string
  termsAndConditions: boolean
}

export interface CreateUserRecord {
  firstName: string
  lastName: string
  email: string
  phoneCode: string | null
  phoneNumber: string | null
  passwordHash: string
  termsAndConditions: boolean
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
  createdAt: string
  updatedAt: string
}
