import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleRemarksQuickNoteDefaults } from "../../src/shared/constants/logRemarksOptionDefaults"
import { LOG_REMARKS_MODULE_SLUG } from "../../src/shared/constants/logRemarksOptionTypes"

const MODULE_SLUGS = [LOG_REMARKS_MODULE_SLUG] as const

export async function seedRemarksQuickNoteTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleRemarksQuickNoteDefaults(moduleSlug)
    // Empty defaults are intentional for quick notes; still log for visibility.
    if (defaults.length === 0) {
      console.log(
        `  No remarks quick note templates to seed for module "${moduleSlug}" (empty defaults)`
      )
      continue
    }

    for (const [index, option] of defaults.entries()) {
      await prisma.remarksQuickNoteTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          remarkTypeId: option.remarkTypeId,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          remarkTypeId: option.remarkTypeId,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} remarks quick note templates for module "${moduleSlug}"`
    )
  }
}
