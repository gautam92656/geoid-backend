import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleWellDefaultWellIdDefaults } from "../../src/shared/constants/wellLogsOptionDefaults"
import { WELL_LOGS_MODULE_SLUG } from "../../src/shared/constants/wellLogsOptionTypes"

const MODULE_SLUGS = [WELL_LOGS_MODULE_SLUG] as const

export async function seedWellDefaultWellIdTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleWellDefaultWellIdDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.wellDefaultWellIdTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,

          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,

          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} default well ids templates for module "${moduleSlug}"`
    )
  }
}
