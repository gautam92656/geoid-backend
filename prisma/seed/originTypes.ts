import type { PrismaClient } from "../../src/generated/prisma/client"
import originTypesData from "../../src/data/originTypesData.json"

type OriginTypeSeed = {
  label: string
  value: string
  sortOrder: number
}

export async function seedOriginTypes(prisma: PrismaClient) {
  const items = originTypesData as OriginTypeSeed[]

  for (const item of items) {
    await prisma.originType.upsert({
      where: { value: item.value },
      update: {
        label: item.label,
        sortOrder: item.sortOrder,
        isActive: true,
        deletedAt: null,
      },
      create: {
        label: item.label,
        value: item.value,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    })
  }

  console.log(`Seeded ${items.length} origin type(s)`)
}
