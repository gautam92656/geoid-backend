import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleWaterObservationTypeDefaults } from "../../src/shared/constants/waterObservationsOptionDefaults"
import { WATER_OBSERVATIONS_MODULE_SLUG } from "../../src/shared/constants/waterObservationsOptionTypes"

const MODULE_SLUGS = [WATER_OBSERVATIONS_MODULE_SLUG] as const

export async function seedWaterObservationTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleWaterObservationTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.waterObservationTypeTemplate.upsert({
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
          depthRequired: option.depthRequired ?? true,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          graphic: option.graphic ?? null,
          depthRequired: option.depthRequired ?? true,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} water observation type templates for module "${moduleSlug}"`
    )
  }
}
