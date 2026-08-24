import type { Prisma, PrismaClient } from "../../src/generated/prisma/client"
import {
  LOG_REPORT_CHART_DEFAULT_SEEDS,
  LOG_REPORT_FIELD_CODE_SEEDS,
} from "../../src/shared/data/logReportCatalogDefaults"

export async function seedLogReportCatalog(prisma: PrismaClient) {
  const fieldKeys = LOG_REPORT_FIELD_CODE_SEEDS.map((row) => ({
    group: row.group,
    code: row.code,
  }))

  const sortByGroup = new Map<string, number>()
  for (const row of LOG_REPORT_FIELD_CODE_SEEDS) {
    const sortOrder = sortByGroup.get(row.group) ?? 0
    sortByGroup.set(row.group, sortOrder + 1)
    await prisma.logReportFieldCode.upsert({
      where: {
        group_code: {
          group: row.group,
          code: row.code,
        },
      },
      update: {
        name: row.name,
        aliases: row.aliases as Prisma.InputJsonValue,
        sortOrder,
        active: true,
      },
      create: {
        group: row.group,
        code: row.code,
        name: row.name,
        aliases: row.aliases as Prisma.InputJsonValue,
        sortOrder,
        active: true,
      },
    })
  }

  await prisma.logReportFieldCode.deleteMany({
    where: {
      NOT: {
        OR: fieldKeys.map((key) => ({ group: key.group, code: key.code })),
      },
    },
  })

  for (const row of LOG_REPORT_CHART_DEFAULT_SEEDS) {
    await prisma.logReportChartDefault.upsert({
      where: { chartKey: row.chartKey },
      update: {
        columnCode: row.columnCode,
        columnText: row.columnText,
        dataSourceGroup: row.dataSourceGroup,
        dataSourceValue: row.dataSourceValue,
        config: row.config as Prisma.InputJsonValue,
        active: true,
      },
      create: {
        chartKey: row.chartKey,
        columnCode: row.columnCode,
        columnText: row.columnText,
        dataSourceGroup: row.dataSourceGroup,
        dataSourceValue: row.dataSourceValue,
        config: row.config as Prisma.InputJsonValue,
        active: true,
      },
    })
  }

  const chartKeys = LOG_REPORT_CHART_DEFAULT_SEEDS.map((row) => row.chartKey)
  await prisma.logReportChartDefault.deleteMany({
    where: { chartKey: { notIn: chartKeys } },
  })

  console.log(
    `  Seeded ${LOG_REPORT_FIELD_CODE_SEEDS.length} log-report field codes and ${LOG_REPORT_CHART_DEFAULT_SEEDS.length} chart default(s)`
  )
}
