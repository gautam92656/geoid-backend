import { prisma } from "../../../infrastructure/database/prisma"
import type { ProjectStatus } from "../../../generated/prisma/client"

export async function findByProjectId(projectId: number) {
  return prisma.projectStatusHistory.findMany({
    where: { projectId },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

export async function createEntry(projectId: number, userId: number, status: ProjectStatus) {
  return prisma.projectStatusHistory.create({
    data: { projectId, userId, status },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  })
}
