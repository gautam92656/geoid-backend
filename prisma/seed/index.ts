import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../src/generated/prisma/client"
import { env } from "../../src/config/env"
import { seedFaqs } from "./faqs"
import { seedUsers } from "./users"

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables")
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting seed...")
  await seedUsers(prisma)
  await seedFaqs(prisma)
  console.log("Seed completed successfully")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
