import type { PrismaClient } from "../../src/generated/prisma/client"

const SEED_USER_EMAIL = "geo@geoid.com"

export async function getSeedUserId(prisma: PrismaClient): Promise<number> {
  const user = await prisma.user.findFirst({
    where: { email: SEED_USER_EMAIL, deletedAt: null },
    select: { id: true },
  })

  if (!user) {
    throw new Error(`Seed user not found: ${SEED_USER_EMAIL}`)
  }

  return user.id
}
