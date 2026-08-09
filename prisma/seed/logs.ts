import type { PrismaClient } from "../../src/generated/prisma/client"
import { DEFAULT_LOG_CONFIGURATIONS } from "../../src/shared/constants/logConfiguration"
import { ensureDefaultEquipmentTypesForUser } from "./equipmentTypes"
import { getSeedUserId } from "./getSeedUser"
import { resetAutoIncrementSequence } from "./resetSequence"

const PROPOSED_BORELOGS = [
  {
    id: 1,
    projectId: 1,
    logNumber: "BH-01",
    latitude: "-37.640123",
    longitude: "144.931456",
    easting: "321456.12",
    northing: "5832145.67",
    utmZone: "55H",
  },
  {
    id: 2,
    projectId: 1,
    logNumber: "BH-02",
    latitude: "-37.640456",
    longitude: "144.931789",
    easting: "321489.45",
    northing: "5832178.90",
    utmZone: "55H",
  },
] as const

const COMPLETED_BORELOG = {
  id: 3,
  projectId: 1,
  logNumber: "BH-03",
  logStatus: "field" as const,
  latitude: "-37.640789",
  longitude: "144.932012",
  easting: "321512.78",
  northing: "5832212.34",
  utmZone: "55H",
  drillingDate: new Date("2026-06-15T00:00:00.000Z"),
  drillingTime: "08:30",
  loggedBy: "Gurram Praveen",
} as const

async function ensureDefaultLogConfiguration(prisma: PrismaClient, userId: number) {
  const existing = await prisma.logConfiguration.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { id: "asc" },
  })

  if (existing) return existing

  return prisma.logConfiguration.create({
    data: {
      userId,
      name: DEFAULT_LOG_CONFIGURATIONS[0].name,
    },
  })
}

async function ensureSeedEquipment(prisma: PrismaClient, userId: number) {
  await ensureDefaultEquipmentTypesForUser(prisma, userId)

  const drillRigType = await prisma.equipmentType.findFirst({
    where: { userId, name: "Drill Rig", deletedAt: null },
    select: { id: true },
  })

  if (!drillRigType) return null

  return prisma.equipment.upsert({
    where: { id: 1 },
    update: {
      userId,
      equipmentTypeId: drillRigType.id,
      equipmentNo: "EQ-001",
      equipmentName: "Drillman GT10",
      suppliers: ["SiteTech Equipment Hire"],
      manufacturer: "Drillman",
      model: "GT10",
      deletedAt: null,
    },
    create: {
      id: 1,
      userId,
      equipmentTypeId: drillRigType.id,
      equipmentNo: "EQ-001",
      equipmentName: "Drillman GT10",
      suppliers: ["SiteTech Equipment Hire"],
      manufacturer: "Drillman",
      model: "GT10",
    },
  })
}

export async function seedLogs(prisma: PrismaClient) {
  const userId = await getSeedUserId(prisma)
  const logConfig = await ensureDefaultLogConfiguration(prisma, userId)
  const logConfigId = String(logConfig.id)
  const equipment = await ensureSeedEquipment(prisma, userId)

  await prisma.project.updateMany({
    where: { id: 1, userId },
    data: { logConfigId },
  })

  const sharedLogData = {
    userId,
    logConfigId,
    logType: "borelog" as const,
    coordinateSystem: "easting-northing",
    supplierId: 2,
    equipmentId: equipment?.id ?? null,
  }

  for (const borelog of PROPOSED_BORELOGS) {
    const { id, projectId, ...data } = borelog
    await prisma.log.upsert({
      where: { id },
      update: {
        ...sharedLogData,
        ...data,
        projectId,
        logStatus: "to_do",
        deletedAt: null,
      },
      create: {
        id,
        ...sharedLogData,
        ...data,
        projectId,
        logStatus: "to_do",
      },
    })
  }

  const { id, projectId, logStatus, drillingDate, drillingTime, loggedBy, ...completedData } =
    COMPLETED_BORELOG

  await prisma.log.upsert({
    where: { id },
    update: {
      ...sharedLogData,
      ...completedData,
      projectId,
      logStatus,
      drillingDate,
      drillingTime,
      loggedBy,
      deletedAt: null,
    },
    create: {
      id,
      ...sharedLogData,
      ...completedData,
      projectId,
      logStatus,
      drillingDate,
      drillingTime,
      loggedBy,
    },
  })

  await resetAutoIncrementSequence(prisma, "logs")
  await resetAutoIncrementSequence(prisma, "equipment")

  console.log(
    `Seeded ${PROPOSED_BORELOGS.length} proposed borelog(s) and 1 completed borelog for project 1`
  )
}
