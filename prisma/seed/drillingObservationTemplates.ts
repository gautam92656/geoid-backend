import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleDrillingObservationDefaults } from "../../src/shared/constants/drillingObservationsOptionDefaults"
import { DRILLING_OBSERVATIONS_MODULE_SLUG } from "../../src/shared/constants/drillingObservationsOptionTypes"

const MODULE_SLUGS = [DRILLING_OBSERVATIONS_MODULE_SLUG] as const

export async function seedDrillingObservationTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleDrillingObservationDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.drillingObservationTemplate.upsert({
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
          depthRequired: option.depthRequired ?? false,
          observationDateTimeRequired: option.observationDateTimeRequired ?? false,
          isDepthOfCasing: option.isDepthOfCasing ?? false,
          isDepthToWater: option.isDepthToWater ?? false,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          graphic: option.graphic ?? null,
          depthRequired: option.depthRequired ?? false,
          observationDateTimeRequired: option.observationDateTimeRequired ?? false,
          isDepthOfCasing: option.isDepthOfCasing ?? false,
          isDepthToWater: option.isDepthToWater ?? false,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} drilling observation templates for module "${moduleSlug}"`
    )
  }
}
