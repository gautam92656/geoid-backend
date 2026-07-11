import { prisma } from "../../../../infrastructure/database/prisma"
import type { OtpType } from "../../../../generated/prisma/client"
import type { CreateOtpRecord } from "./otp.types"

export async function create(data: CreateOtpRecord) {
  return prisma.otpVerification.create({ data })
}

export async function findLatestUnusedValid(email: string, otpType: OtpType) {
  return prisma.otpVerification.findFirst({
    where: {
      email,
      otpType,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function markUsed(id: number) {
  return prisma.otpVerification.update({
    where: { id },
    data: { isUsed: true },
  })
}

export async function invalidateByEmailAndType(email: string, otpType: OtpType) {
  return prisma.otpVerification.updateMany({
    where: { email, otpType, isUsed: false },
    data: { isUsed: true },
  })
}
