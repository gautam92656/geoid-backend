import type { PrismaClient } from "../../src/generated/prisma/client"
import { DEFAULT_LOG_CONFIGURATION_TEMPLATES } from "../../src/shared/constants/logConfigurationTemplate"

export async function seedLogConfigurationTemplates(prisma: PrismaClient) {
  for (const template of DEFAULT_LOG_CONFIGURATION_TEMPLATES) {
    await prisma.logConfigurationTemplate.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        description: template.description,
        region: template.region,
        disciplines: [...template.disciplines],
        isAvailable: template.isAvailable,
        sortOrder: template.sortOrder,
      },
      create: {
        slug: template.slug,
        name: template.name,
        description: template.description,
        region: template.region,
        disciplines: [...template.disciplines],
        isAvailable: template.isAvailable,
        sortOrder: template.sortOrder,
      },
    })
  }

  console.log(`Seeded ${DEFAULT_LOG_CONFIGURATION_TEMPLATES.length} log configuration template(s)`)
}
