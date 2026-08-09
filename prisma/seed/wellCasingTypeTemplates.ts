import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleWellCasingTypeDefaults } from "../../src/shared/constants/wellLogsOptionDefaults"
import { WELL_LOGS_MODULE_SLUG } from "../../src/shared/constants/wellLogsOptionTypes"

const MODULE_SLUGS = [WELL_LOGS_MODULE_SLUG] as const

export async function seedWellCasingTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleWellCasingTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.wellCasingTypeTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          type: option.type === "regular" ? "regular" : "surface",
          graphic: option.graphic ?? null,
          allowNegativeDepth: option.allowNegativeDepth ?? false,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          type: option.type === "regular" ? "regular" : "surface",
          graphic: option.graphic ?? null,
          allowNegativeDepth: option.allowNegativeDepth ?? false,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} well casing types templates for module "${moduleSlug}"`
    )
  }
}
