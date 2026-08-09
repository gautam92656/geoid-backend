import { prisma } from "../../../infrastructure/database/prisma"

export async function findAllActive() {
  return prisma.originType.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      id: true,
      label: true,
      value: true,
      sortOrder: true,
    },
  })
}
