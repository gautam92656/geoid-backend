import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleDrillingTypeDefaults } from "../../src/shared/constants/drillingObservationsOptionDefaults"
import { DRILLING_OBSERVATIONS_MODULE_SLUG } from "../../src/shared/constants/drillingObservationsOptionTypes"

const MODULE_SLUGS = [DRILLING_OBSERVATIONS_MODULE_SLUG] as const

export async function seedDrillingTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleDrillingTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.drillingTypeTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          logKind: option.logKind ?? "bore",
          graphic: option.graphic ?? null,
          enableRecoveryField: option.enableRecoveryField ?? false,
          enableWindowedWindowless: option.enableWindowedWindowless ?? false,
          waterAdded: option.waterAdded ?? false,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          logKind: option.logKind ?? "bore",
          graphic: option.graphic ?? null,
          enableRecoveryField: option.enableRecoveryField ?? false,
          enableWindowedWindowless: option.enableWindowedWindowless ?? false,
          waterAdded: option.waterAdded ?? false,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} drilling type templates for module "${moduleSlug}"`
    )
  }
}
