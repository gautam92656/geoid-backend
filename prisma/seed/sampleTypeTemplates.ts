import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleSampleTypeDefaults } from "../../src/shared/constants/samplesOptionDefaults"
import { SAMPLES_MODULE_SLUG } from "../../src/shared/constants/samplesOptionTypes"

const MODULE_SLUGS = [SAMPLES_MODULE_SLUG] as const

export async function seedSampleTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleSampleTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.sampleTypeTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          graphic: option.graphic ?? null,
          sampleAbbreviation: option.sampleAbbreviation ?? null,
          noteRecovery: option.noteRecovery ?? false,
          displayQcId: option.displayQcId ?? false,
          enableSegregatedGraphic: option.enableSegregatedGraphic ?? false,
          topGraphic: option.topGraphic ?? null,
          bottomGraphic: option.bottomGraphic ?? null,
          enableSubsurfaceLogging: option.enableSubsurfaceLogging ?? false,
          enableAssignLabTest: option.enableAssignLabTest ?? false,
          enableInsituTestLogging: option.enableInsituTestLogging ?? false,
          defaultInsituTestTypeId: option.defaultInsituTestTypeId ?? null,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          graphic: option.graphic ?? null,
          sampleAbbreviation: option.sampleAbbreviation ?? null,
          noteRecovery: option.noteRecovery ?? false,
          displayQcId: option.displayQcId ?? false,
          enableSegregatedGraphic: option.enableSegregatedGraphic ?? false,
          topGraphic: option.topGraphic ?? null,
          bottomGraphic: option.bottomGraphic ?? null,
          enableSubsurfaceLogging: option.enableSubsurfaceLogging ?? false,
          enableAssignLabTest: option.enableAssignLabTest ?? false,
          enableInsituTestLogging: option.enableInsituTestLogging ?? false,
          defaultInsituTestTypeId: option.defaultInsituTestTypeId ?? null,
          sortOrder: index,
        },
      })
    }

    console.log(`  Seeded ${defaults.length} sample type templates for module "${moduleSlug}"`)
  }
}
