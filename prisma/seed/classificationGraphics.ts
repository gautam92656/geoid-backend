import type { PrismaClient } from "../../src/generated/prisma/client"
import classificationGraphicsData from "../../src/data/classificationGraphicsData.json"

type ClassificationGraphicSeed = {
  code: string
  path: string
  sortOrder: number
}

export async function seedClassificationGraphics(prisma: PrismaClient) {
  const items = classificationGraphicsData as ClassificationGraphicSeed[]

  for (const item of items) {
    await prisma.classificationGraphic.upsert({
      where: { filename: item.path },
      update: {
        code: item.code,
        sortOrder: item.sortOrder,
        isActive: true,
        deletedAt: null,
      },
      create: {
        code: item.code,
        filename: item.path,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    })
  }

  console.log(`Seeded ${items.length} classification graphic(s)`)
}
