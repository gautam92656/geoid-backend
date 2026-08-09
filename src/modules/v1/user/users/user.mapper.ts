import type { User } from "../../../../generated/prisma/client"
import type { UserDTO } from "./user.types"

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneCode: user.phoneCode ?? null,
    phoneNumber: user.phoneNumber,
    termsAndConditions: user.termsAndConditions,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    companyName: user.companyName ?? null,
    companyLogoUrl: user.companyLogoUrl ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
