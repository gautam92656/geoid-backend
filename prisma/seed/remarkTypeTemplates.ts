import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleRemarkTypeDefaults } from "../../src/shared/constants/logRemarksOptionDefaults"
import { LOG_REMARKS_MODULE_SLUG } from "../../src/shared/constants/logRemarksOptionTypes"

const MODULE_SLUGS = [LOG_REMARKS_MODULE_SLUG] as const

export async function seedRemarkTypeTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleRemarkTypeDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.remarkTypeTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          tablogsAlias: option.tablogsAlias ?? null,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} remark type templates for module "${moduleSlug}"`
    )
  }
}
