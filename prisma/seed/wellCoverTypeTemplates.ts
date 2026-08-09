import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleWellCoverTypeDefaults } from "../../src/shared/constants/wellLogsOptionDefaults"
import { WELL_LOGS_MODULE_SLUG } from "../../src/shared/constants/wellLogsOptionTypes"

const MODULE_SLUGS = [WELL_LOGS_MODULE_SLUG] as const

export async function seedWellCoverTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleWellCoverTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.wellCoverTypeTemplate.upsert({
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
          allowNegativeDepth: option.allowNegativeDepth ?? false,
          graphicAlignment: option.graphicAlignment === "top" ? "top" : "bottom",
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          graphic: option.graphic ?? null,
          allowNegativeDepth: option.allowNegativeDepth ?? false,
          graphicAlignment: option.graphicAlignment === "top" ? "top" : "bottom",
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} well cover types templates for module "${moduleSlug}"`
    )
  }
}
