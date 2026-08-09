import { prisma } from "../../../infrastructure/database/prisma"

export async function findAllActive() {
  return prisma.classificationGraphic.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { filename: "asc" }],
    select: {
      code: true,
      filename: true,
    },
  })
}

export async function findActiveByFilename(filename: string) {
  return prisma.classificationGraphic.findFirst({
    where: {
      filename,
      deletedAt: null,
      isActive: true,
    },
    select: {
      code: true,
      filename: true,
    },
  })
}
