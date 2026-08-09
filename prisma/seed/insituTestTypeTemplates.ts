import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleInsituTestTypeDefaults } from "../../src/shared/constants/insituTestTypeDefaults"
import { INSITU_TESTS_MODULE_SLUG } from "../../src/shared/constants/insituTestTypeTypes"

const MODULE_SLUGS_WITH_INSITU_TEST_TYPES = [INSITU_TESTS_MODULE_SLUG] as const

export async function seedInsituTestTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS_WITH_INSITU_TEST_TYPES) {
    const defaults = getModuleInsituTestTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    const defaultKeys = defaults.map((option) => option.id)

    for (const [index, option] of defaults.entries()) {
      await prisma.insituTestTypeTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          active: option.active ?? true,
          graphic: option.graphic ?? null,
          enableSegregatedGraphic: option.enableSegregatedGraphic ?? false,
          topGraphic: option.topGraphic ?? null,
          bottomGraphic: option.bottomGraphic ?? null,
          depthFrequencyEnabled: option.depthFrequencyEnabled ?? false,
          depthFrequency: option.depthFrequency ?? null,
          enableSampleLogging: option.enableSampleLogging ?? false,
          enableSubsurfaceLogging: option.enableSubsurfaceLogging ?? false,
          defaultSampleTypeId: option.defaultSampleTypeId ?? null,
          enableAutoSampleDescription: option.enableAutoSampleDescription ?? false,
          settings: (option.settings ?? { otherSettings: [] }) as object,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          active: option.active ?? true,
          graphic: option.graphic ?? null,
          enableSegregatedGraphic: option.enableSegregatedGraphic ?? false,
          topGraphic: option.topGraphic ?? null,
          bottomGraphic: option.bottomGraphic ?? null,
          depthFrequencyEnabled: option.depthFrequencyEnabled ?? false,
          depthFrequency: option.depthFrequency ?? null,
          enableSampleLogging: option.enableSampleLogging ?? false,
          enableSubsurfaceLogging: option.enableSubsurfaceLogging ?? false,
          defaultSampleTypeId: option.defaultSampleTypeId ?? null,
          enableAutoSampleDescription: option.enableAutoSampleDescription ?? false,
          settings: (option.settings ?? { otherSettings: [] }) as object,
          sortOrder: index,
        },
      })
    }

    // Drop obsolete catalog entries that are no longer part of the defaults.
    await prisma.insituTestTypeTemplate.deleteMany({
      where: {
        moduleSlug,
        optionKey: { notIn: defaultKeys },
      },
    })

    console.log(
      `  Seeded ${defaults.length} Insitu test type templates for module "${moduleSlug}"`
    )
  }
}
