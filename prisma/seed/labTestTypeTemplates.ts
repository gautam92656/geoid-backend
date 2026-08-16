import type { PrismaClient } from "../../src/generated/prisma/client"
import { Prisma } from "../../src/generated/prisma/client"
import { getModuleLabTestTypeDefaults } from "../../src/shared/constants/labTestsOptionDefaults"
import { LAB_TESTS_MODULE_SLUG } from "../../src/shared/constants/labTestsOptionTypes"

const MODULE_SLUGS = [LAB_TESTS_MODULE_SLUG] as const

export async function seedLabTestTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleLabTestTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    const defaultKeys = defaults.map((option) => option.id)

    for (const [index, option] of defaults.entries()) {
      await prisma.labTestTypeTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          graphic: option.graphic ?? null,
          externalAlias: option.externalAlias ?? null,
          aliasTable: option.aliasTable ?? null,
          addAsSelectedDataPlot: option.addAsSelectedDataPlot ?? false,
          active: option.active !== false,
          labTestResultFields: (option.labTestResultFields ?? []) as Prisma.InputJsonValue,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          graphic: option.graphic ?? null,
          externalAlias: option.externalAlias ?? null,
          aliasTable: option.aliasTable ?? null,
          addAsSelectedDataPlot: option.addAsSelectedDataPlot ?? false,
          active: option.active !== false,
          labTestResultFields: (option.labTestResultFields ?? []) as Prisma.InputJsonValue,
          sortOrder: index,
        },
      })
    }

    await prisma.labTestTypeTemplate.deleteMany({
      where: {
        moduleSlug,
        optionKey: { notIn: defaultKeys },
      },
    })

    console.log(`  Seeded ${defaults.length} lab test type templates for module "${moduleSlug}"`)
  }
}
