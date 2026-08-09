import type { PrismaClient } from "../../src/generated/prisma/client"
import { getSeedUserId } from "./getSeedUser"
import { resetAutoIncrementSequence } from "./resetSequence"

const PROJECTS = [
  {
    id: 1,
    projectNo: "13659",
    name: "Geotechnical Investigation Report",
    address: "Lot 1103 Darmain Drive Greenvale",
    status: "to_do" as const,
    assignee: "Gurram Praveen",
    clientId: 1,
    brief:
      "Geotechnical investigation for residential development including borehole logging, soil sampling, and foundation recommendations.",
  },
  {
    id: 2,
    projectNo: "13658",
    name: "Geotechnical Investigation Report",
    address: "Lot 1102 Darmain Drive Greenvale",
    status: "in_progress" as const,
    assignee: "Gurram Praveen",
    clientId: 2,
    brief:
      "Site investigation and reporting for proposed dwelling on Lot 1102, including compaction testing and bearing capacity assessment.",
  },
  {
    id: 3,
    projectNo: "13657",
    name: "Geotechnical Investigation Report",
    address: "Lot 1101 Darmain Drive Greenvale",
    status: "to_do" as const,
    assignee: "Sarah Mitchell",
    clientId: 3,
    brief:
      "Preliminary geotechnical assessment for subdivision works, focusing on soil classification and groundwater conditions.",
  },
  {
    id: 4,
    projectNo: "13656",
    name: "Geotechnical Investigation Report",
    address: "Lot 1100 Darmain Drive Greenvale",
    status: "completed" as const,
    assignee: "Sarah Mitchell",
    clientId: 4,
    brief:
      "Final geotechnical report for Lot 1100 including pavement design recommendations and earthworks suitability review.",
  },
]

export async function seedProjects(prisma: PrismaClient) {
  const userId = await getSeedUserId(prisma)

  for (const { id, ...data } of PROJECTS) {
    await prisma.project.upsert({
      where: { id },
      update: { ...data, userId },
      create: { id, ...data, userId },
    })
  }

  await resetAutoIncrementSequence(prisma, "projects")

  console.log(`Seeded ${PROJECTS.length} project(s)`)
}
