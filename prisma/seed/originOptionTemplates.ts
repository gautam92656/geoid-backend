import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleOriginOptionDefaults } from "../../src/shared/constants/originOptionDefaults"

const MODULE_SLUGS_WITH_ORIGINS = ["subsurfaces"] as const

export async function seedOriginOptionTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS_WITH_ORIGINS) {
    const defaults = getModuleOriginOptionDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.originOptionTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          nameInDescription: option.nameInDescription ?? option.name,
          codeInDescription: option.codeInDescription ?? null,
          classificationCodeOverride: option.classificationCodeOverride ?? false,
          type: option.type ?? "Soil",
          color: option.color ?? null,
          applyColorToPdf: option.applyColorToPdf ?? false,
          overrideGraphic: option.overrideGraphic ?? false,
          splitGraphic: option.splitGraphic ?? false,
          graphic: option.graphic ?? null,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          nameInDescription: option.nameInDescription ?? option.name,
          codeInDescription: option.codeInDescription ?? null,
          classificationCodeOverride: option.classificationCodeOverride ?? false,
          type: option.type ?? "Soil",
          color: option.color ?? null,
          applyColorToPdf: option.applyColorToPdf ?? false,
          overrideGraphic: option.overrideGraphic ?? false,
          splitGraphic: option.splitGraphic ?? false,
          graphic: option.graphic ?? null,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} origin option templates for module "${moduleSlug}"`
    )
  }
}
