import type { Prisma, PrismaClient } from "../../src/generated/prisma/client"
import { getModuleWorkflowDefaults } from "../../src/shared/constants/workflowDefaults"

const SUBSURFACES_MODULE_SLUG = "subsurfaces"

export async function seedWorkflowTemplates(prisma: PrismaClient) {
  const defaults = getModuleWorkflowDefaults(SUBSURFACES_MODULE_SLUG)
  if (!defaults) {
    console.warn("No workflow defaults found for subsurfaces — skipping template seed")
    return
  }

  const classificationCodes = (defaults.classificationCodes ??
    []) as Prisma.InputJsonValue

  await prisma.workflowTemplate.upsert({
    where: { moduleSlug: SUBSURFACES_MODULE_SLUG },
    update: {
      name: defaults.name,
      enabled: defaults.enabled,
      applyClassificationRules: defaults.applyClassificationRules ?? true,
      ignoreParentLegacySettings: defaults.ignoreParentLegacySettings ?? true,
      steps: defaults.steps,
      classificationCodes,
    },
    create: {
      moduleSlug: SUBSURFACES_MODULE_SLUG,
      name: defaults.name,
      enabled: defaults.enabled,
      applyClassificationRules: defaults.applyClassificationRules ?? true,
      ignoreParentLegacySettings: defaults.ignoreParentLegacySettings ?? true,
      steps: defaults.steps,
      classificationCodes,
    },
  })

  console.log("Seeded log configuration workflow template(s)")
}
