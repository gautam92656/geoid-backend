import { prisma } from "../../../infrastructure/database/prisma"
import type { Prisma } from "../../../generated/prisma/client"

const LOG_DATA_INCLUDE = {
  subsurfaceLayers: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  remarks: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  samples: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  insituTests: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  labTests: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  drillingObservations: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  drillingMethods: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  drillingResistances: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  drillingCasings: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  waterObservations: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  wellLogs: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  wellCovers: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  wellProbes: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  wellBackfills: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  wellCasings: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  wellCasingTops: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  rqdTcrs: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  coreDefects: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  finishLogs: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.LogInclude

export async function findSourceForCopy(userId: number, projectId: number) {
  return prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
    include: {
      client: { select: { id: true, companyName: true } },
      logs: {
        where: { deletedAt: null },
        orderBy: { id: "asc" },
        include: LOG_DATA_INCLUDE,
      },
    },
  })
}

type SourceProject = NonNullable<Awaited<ReturnType<typeof findSourceForCopy>>>
type SourceLog = SourceProject["logs"][number]

function remapSampleId(
  sampleId: number | null,
  sampleIdMap: Map<number, number>
): number | null {
  if (sampleId == null) return null
  return sampleIdMap.get(sampleId) ?? null
}

async function copyLogRelatedData(
  tx: Prisma.TransactionClient,
  sourceLog: SourceLog,
  userId: number,
  newProjectId: number,
  newLogId: number
) {
  const base = { userId, projectId: newProjectId, logId: newLogId }

  if (sourceLog.subsurfaceLayers.length > 0) {
    await tx.logSubsurfaceLayer.createMany({
      data: sourceLog.subsurfaceLayers.map((row) => ({
        ...base,
        depth: row.depth,
        classification: row.classification,
        origin: row.origin,
        description: row.description,
        consistency: row.consistency,
        moisture: row.moisture,
        remarks: row.remarks,
        hatch: row.hatch,
        values: row.values as Prisma.InputJsonValue,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.remarks.length > 0) {
    await tx.logRemark.createMany({
      data: sourceLog.remarks.map((row) => ({
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        remarkTypeId: row.remarkTypeId,
        remarkTypeName: row.remarkTypeName,
        remarks: row.remarks,
        sortOrder: row.sortOrder,
      })),
    })
  }

  const sampleIdMap = new Map<number, number>()
  for (const row of sourceLog.samples) {
    const created = await tx.logSample.create({
      data: {
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        sampleTypeId: row.sampleTypeId,
        sampleTypeName: row.sampleTypeName,
        sampleNo: row.sampleNo,
        qcSampleId: row.qcSampleId,
        sampleDate: row.sampleDate,
        sampleTime: row.sampleTime,
        recovery: row.recovery,
        comments: row.comments,
        labTestRequestId: row.labTestRequestId,
        labTestRequestName: row.labTestRequestName,
        labTestTypeIds: row.labTestTypeIds as Prisma.InputJsonValue,
        subsurfaceClassification: row.subsurfaceClassification,
        insituTests: row.insituTests as Prisma.InputJsonValue,
        sortOrder: row.sortOrder,
      },
    })
    sampleIdMap.set(row.id, created.id)
  }

  if (sourceLog.insituTests.length > 0) {
    await tx.logInsituTest.createMany({
      data: sourceLog.insituTests.map((row) => ({
        ...base,
        sampleId: remapSampleId(row.sampleId, sampleIdMap),
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        testTypeId: row.testTypeId,
        testTypeName: row.testTypeName,
        results: row.results,
        comments: row.comments,
        resultValues: row.resultValues as Prisma.InputJsonValue,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.labTests.length > 0) {
    await tx.logLabTest.createMany({
      data: sourceLog.labTests.map((row) => ({
        ...base,
        sampleId: remapSampleId(row.sampleId, sampleIdMap),
        sampleNo: row.sampleNo,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        testTypeId: row.testTypeId,
        testTypeName: row.testTypeName,
        results: row.results,
        comments: row.comments,
        resultValues: row.resultValues as Prisma.InputJsonValue,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.drillingObservations.length > 0) {
    await tx.logDrillingObservation.createMany({
      data: sourceLog.drillingObservations.map((row) => ({
        ...base,
        depth: row.depth,
        depthOfCasing: row.depthOfCasing,
        depthToWater: row.depthToWater,
        observationTypeId: row.observationTypeId,
        observationTypeName: row.observationTypeName,
        observationDate: row.observationDate,
        observationTime: row.observationTime,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.drillingMethods.length > 0) {
    await tx.logDrillingMethod.createMany({
      data: sourceLog.drillingMethods.map((row) => ({
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        drillingMethodId: row.drillingMethodId,
        drillingMethodName: row.drillingMethodName,
        windowedWindowless: row.windowedWindowless,
        diameter: row.diameter,
        recovery: row.recovery,
        waterAdded: row.waterAdded,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.drillingResistances.length > 0) {
    await tx.logDrillingResistance.createMany({
      data: sourceLog.drillingResistances.map((row) => ({
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        resistanceTypeId: row.resistanceTypeId,
        resistanceTypeName: row.resistanceTypeName,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.drillingCasings.length > 0) {
    await tx.logDrillingCasing.createMany({
      data: sourceLog.drillingCasings.map((row) => ({
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        casingTypeId: row.casingTypeId,
        casingTypeName: row.casingTypeName,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.waterObservations.length > 0) {
    await tx.logWaterObservation.createMany({
      data: sourceLog.waterObservations.map((row) => ({
        ...base,
        depth: row.depth,
        observationTypeId: row.observationTypeId,
        observationTypeName: row.observationTypeName,
        observationDate: row.observationDate,
        observationTime: row.observationTime,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.wellLogs.length > 0) {
    await tx.logWellLog.createMany({
      data: sourceLog.wellLogs.map((row) => ({
        ...base,
        wellId: row.wellId,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        wellTypeId: row.wellTypeId,
        wellTypeName: row.wellTypeName,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.wellCovers.length > 0) {
    await tx.logWellCover.createMany({
      data: sourceLog.wellCovers.map((row) => ({
        ...base,
        wellId: row.wellId,
        wellIdLabel: row.wellIdLabel,
        wellCoverTypeId: row.wellCoverTypeId,
        wellCoverTypeName: row.wellCoverTypeName,
        depth: row.depth,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.wellProbes.length > 0) {
    await tx.logWellProbe.createMany({
      data: sourceLog.wellProbes.map((row) => ({
        ...base,
        wellId: row.wellId,
        wellIdLabel: row.wellIdLabel,
        probeTypeId: row.probeTypeId,
        probeTypeName: row.probeTypeName,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.wellBackfills.length > 0) {
    await tx.logWellBackfill.createMany({
      data: sourceLog.wellBackfills.map((row) => ({
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        backfillTypeId: row.backfillTypeId,
        backfillTypeName: row.backfillTypeName,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.wellCasings.length > 0) {
    await tx.logWellCasing.createMany({
      data: sourceLog.wellCasings.map((row) => ({
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        casingTypeId: row.casingTypeId,
        casingTypeName: row.casingTypeName,
        comments: row.comments,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.wellCasingTops.length > 0) {
    await tx.logWellCasingTop.createMany({
      data: sourceLog.wellCasingTops.map((row) => ({
        ...base,
        elevation: row.elevation,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        casingTypeId: row.casingTypeId,
        casingTypeName: row.casingTypeName,
        notes: row.notes,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.rqdTcrs.length > 0) {
    await tx.logRqdTcr.createMany({
      data: sourceLog.rqdTcrs.map((row) => ({
        ...base,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        startDate: row.startDate,
        startTime: row.startTime,
        endDate: row.endDate,
        endTime: row.endTime,
        corePieceLength: row.corePieceLength,
        rqdPercent: row.rqdPercent,
        coreLossLength: row.coreLossLength,
        coreRecoveryLength: row.coreRecoveryLength,
        tcrPercent: row.tcrPercent,
        photoName: row.photoName,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.coreDefects.length > 0) {
    await tx.logCoreDefect.createMany({
      data: sourceLog.coreDefects.map((row) => ({
        ...base,
        defectTypeId: row.defectTypeId,
        defectTypeName: row.defectTypeName,
        depthFrom: row.depthFrom,
        depthTo: row.depthTo,
        defectOrientation: row.defectOrientation,
        surfaceShapeIds: row.surfaceShapeIds as Prisma.InputJsonValue,
        surfaceRoughnessIds: row.surfaceRoughnessIds as Prisma.InputJsonValue,
        defectCoatingIds: row.defectCoatingIds as Prisma.InputJsonValue,
        defectOpennessIds: row.defectOpennessIds as Prisma.InputJsonValue,
        defectSpacingOverride: row.defectSpacingOverride,
        boundsOnDefectMin: row.boundsOnDefectMin,
        boundsOnDefectMax: row.boundsOnDefectMax,
        comments: row.comments,
        photoName: row.photoName,
        sortOrder: row.sortOrder,
      })),
    })
  }

  if (sourceLog.finishLogs.length > 0) {
    await tx.logFinishLog.createMany({
      data: sourceLog.finishLogs.map((row) => ({
        ...base,
        finishTypeId: row.finishTypeId,
        finishTypeName: row.finishTypeName,
        completedDate: row.completedDate,
        endDepth: row.endDepth,
        comments: row.comments,
        scaleLogReport: row.scaleLogReport,
        sortOrder: row.sortOrder,
      })),
    })
  }
}

export async function deepCopyProject(
  source: SourceProject,
  userId: number,
  projectNo: string
) {
  return prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        userId,
        projectNo,
        name: source.name,
        address: source.address,
        status: source.status,
        brief: source.brief,
        assignee: source.assignee,
        logConfigId: source.logConfigId,
        clientId: source.clientId,
        office: source.office,
        startDate: source.startDate,
        endDate: source.endDate,
        coordinateSystem: source.coordinateSystem,
        latitude: source.latitude,
        longitude: source.longitude,
        easting: source.easting,
        northing: source.northing,
        utmZone: source.utmZone,
      },
      include: { client: { select: { id: true, companyName: true } } },
    })

    await tx.projectStatusHistory.create({
      data: {
        projectId: createdProject.id,
        userId,
        status: createdProject.status,
      },
    })

    const logIdMap = new Map<number, number>()

    for (const sourceLog of source.logs) {
      const createdLog = await tx.log.create({
        data: {
          userId,
          projectId: createdProject.id,
          proposedBorelogId: null,
          logNumber: sourceLog.logNumber,
          logConfigId: sourceLog.logConfigId,
          logType: sourceLog.logType,
          logStatus: sourceLog.logStatus,
          drillingDate: sourceLog.drillingDate,
          drillingTime: sourceLog.drillingTime,
          finishLogDate: sourceLog.finishLogDate,
          finishLogTime: sourceLog.finishLogTime,
          endDepth: sourceLog.endDepth,
          finishingReason: sourceLog.finishingReason,
          finishingComment: sourceLog.finishingComment,
          scaleLogReport: sourceLog.scaleLogReport,
          coordinateSystem: sourceLog.coordinateSystem,
          latitude: sourceLog.latitude,
          longitude: sourceLog.longitude,
          easting: sourceLog.easting,
          northing: sourceLog.northing,
          utmZone: sourceLog.utmZone,
          elevation: sourceLog.elevation,
          station: sourceLog.station,
          locationComment: sourceLog.locationComment,
          supplierId: sourceLog.supplierId,
          equipmentId: sourceLog.equipmentId,
          loggedBy: sourceLog.loggedBy,
          reviewedBy: sourceLog.reviewedBy,
          inclination: sourceLog.inclination,
          azimuth: sourceLog.azimuth,
          generalComments: sourceLog.generalComments,
        },
      })

      logIdMap.set(sourceLog.id, createdLog.id)
      await copyLogRelatedData(tx, sourceLog, userId, createdProject.id, createdLog.id)
    }

    for (const sourceLog of source.logs) {
      if (sourceLog.proposedBorelogId == null) continue
      const newLogId = logIdMap.get(sourceLog.id)
      const newProposedId = logIdMap.get(sourceLog.proposedBorelogId)
      if (newLogId == null || newProposedId == null) continue

      await tx.log.update({
        where: { id: newLogId },
        data: { proposedBorelogId: newProposedId },
      })
    }

    return createdProject
  })
}
