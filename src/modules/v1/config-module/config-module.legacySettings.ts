import { prisma } from "../../../infrastructure/database/prisma"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

async function readUserModuleSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<Record<string, unknown> | null> {
  const row = await prisma.userModule.findFirst({
    where: {
      userId,
      logConfigurationId,
      sourceSlug: moduleSlug.trim(),
      deletedAt: null,
    },
    select: { settings: true },
  })

  if (!row || !isRecord(row.settings)) return null
  return row.settings
}

/**
 * Read a data-type option list from legacy `user_modules.settings.dataTypeOptions`
 * so existing Core Logging customizations can be migrated into dedicated tables.
 */
export async function readLegacyModuleDataTypeOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string
): Promise<unknown[]> {
  const settings = await readUserModuleSettings(userId, logConfigurationId, moduleSlug)
  if (!settings) return []

  const dataTypeOptions = isRecord(settings.dataTypeOptions) ? settings.dataTypeOptions : null
  if (dataTypeOptions) {
    const options = dataTypeOptions[dataTypeId]
    if (Array.isArray(options) && options.length > 0) return options
  }

  // Finish texts historically lived under settings.subsurface.finishTexts.
  if (dataTypeId === "finish-texts") {
    const subsurface = isRecord(settings.subsurface) ? settings.subsurface : null
    const finishTexts = subsurface && Array.isArray(subsurface.finishTexts) ? subsurface.finishTexts : []
    if (finishTexts.length > 0) return finishTexts
  }

  // Default well IDs historically lived under settings.wellLogs.defaultWellIds.
  if (dataTypeId === "default-well-ids") {
    const wellLogs = isRecord(settings.wellLogs) ? settings.wellLogs : null
    const defaultWellIds =
      wellLogs && Array.isArray(wellLogs.defaultWellIds) ? wellLogs.defaultWellIds : []
    if (defaultWellIds.length > 0) return defaultWellIds
  }

  return []
}
