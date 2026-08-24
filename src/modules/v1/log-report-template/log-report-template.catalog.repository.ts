import { prisma } from "../../../infrastructure/database/prisma"

export async function findActiveFieldCodes() {
  return prisma.logReportFieldCode.findMany({
    where: { active: true },
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  })
}

export async function findActiveChartDefaults() {
  return prisma.logReportChartDefault.findMany({
    where: { active: true },
    orderBy: { chartKey: "asc" },
  })
}
