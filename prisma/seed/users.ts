import bcrypt from "bcrypt"
import type { PrismaClient } from "../../src/generated/prisma/client"
import { BCRYPT_SALT_ROUNDS } from "../../src/shared/constants"

export const SEED_USER = {
  email: "geo@geoid.com",
  password: "Test@1234",
  firstName: "Geo",
  lastName: "User",
} as const

export async function seedUsers(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash(SEED_USER.password, BCRYPT_SALT_ROUNDS)

  await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {
      firstName: SEED_USER.firstName,
      lastName: SEED_USER.lastName,
      passwordHash,
      termsAndConditions: true,
      isEmailVerified: true,
      role: "super_admin",
      deletedAt: null,
    },
    create: {
      firstName: SEED_USER.firstName,
      lastName: SEED_USER.lastName,
      email: SEED_USER.email,
      passwordHash,
      termsAndConditions: true,
      isEmailVerified: true,
      role: "super_admin",
    },
  })

  console.log("Seeded super admin login:")
  console.log(`  Email:    ${SEED_USER.email}`)
  console.log(`  Password: ${SEED_USER.password}`)
}
