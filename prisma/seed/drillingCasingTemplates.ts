import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleDrillingCasingDefaults } from "../../src/shared/constants/drillingObservationsOptionDefaults"
import { DRILLING_OBSERVATIONS_MODULE_SLUG } from "../../src/shared/constants/drillingObservationsOptionTypes"

const MODULE_SLUGS = [DRILLING_OBSERVATIONS_MODULE_SLUG] as const

export async function seedDrillingCasingTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleDrillingCasingDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.drillingCasingTemplate.upsert({
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
          startGraphic: option.startGraphic ?? null,
          endGraphic: option.endGraphic ?? null,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          graphic: option.graphic ?? null,
          startGraphic: option.startGraphic ?? null,
          endGraphic: option.endGraphic ?? null,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} drilling casing templates for module "${moduleSlug}"`
    )
  }
}
