import type { PrismaClient } from "../../src/generated/prisma/client"
import { getSeedUserId } from "./getSeedUser"
import { resetAutoIncrementSequence } from "./resetSequence"

const CLIENTS = [
  {
    id: 1,
    companyName: "Design E",
    companyContact: "Emma Richardson",
    email: "emma@designe.com.au",
    phone: "+61 412 345 678",
    externalId: "CLI-001",
    status: "active" as const,
  },
  {
    id: 2,
    companyName: "Hudston Homes",
    companyContact: "James Hudston",
    email: "james@hudstonhomes.com.au",
    phone: "+61 423 456 789",
    externalId: "CLI-002",
    status: "active" as const,
  },
  {
    id: 3,
    companyName: "Whiterose Studio",
    companyContact: "Sarah Chen",
    email: "sarah@whiterose.studio",
    phone: "+61 434 567 890",
    externalId: "CLI-003",
    status: "active" as const,
  },
  {
    id: 4,
    companyName: "GeoLog Engineering",
    companyContact: "Michael Torres",
    email: "michael@geoid.com.au",
    phone: "+61 445 678 901",
    externalId: "CLI-004",
    status: "active" as const,
  },
  {
    id: 5,
    companyName: "BuildCorp Pty Ltd",
    companyContact: "Lisa Nguyen",
    email: "lisa@buildcorp.com.au",
    phone: "+61 456 789 012",
    externalId: "CLI-005",
    status: "inactive" as const,
  },
]

export async function seedClients(prisma: PrismaClient) {
  const userId = await getSeedUserId(prisma)

  for (const { id, ...data } of CLIENTS) {
    await prisma.client.upsert({
      where: { id },
      update: { ...data, userId },
      create: { id, ...data, userId },
    })
  }

  await resetAutoIncrementSequence(prisma, "clients")

  console.log(`Seeded ${CLIENTS.length} client(s)`)
}
