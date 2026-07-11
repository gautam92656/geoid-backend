import type { OtpType } from "../../../../generated/prisma/client"

export interface CreateOtpRecord {
  email: string
  otpCode: string
  otpType: OtpType
  expiresAt: Date
}
