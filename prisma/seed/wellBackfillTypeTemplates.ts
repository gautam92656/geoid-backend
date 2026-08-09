import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleWellBackfillTypeDefaults } from "../../src/shared/constants/wellLogsOptionDefaults"
import { WELL_LOGS_MODULE_SLUG } from "../../src/shared/constants/wellLogsOptionTypes"

const MODULE_SLUGS = [WELL_LOGS_MODULE_SLUG] as const

export async function seedWellBackfillTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleWellBackfillTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.wellBackfillTypeTemplate.upsert({
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
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          graphic: option.graphic ?? null,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} well backfill types templates for module "${moduleSlug}"`
    )
  }
}
