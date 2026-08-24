import { prisma } from "../../../infrastructure/database/prisma"
import { NotFoundError } from "../../../shared/errors/NotFoundError"

import { ConflictError } from "../../../shared/errors/ConflictError"

import { DEFAULT_LOG_CONFIGURATIONS } from "../../../shared/constants/logConfiguration"

import { resolveLogConfigurationSettings, type LogConfigurationSettings } from "../../../shared/constants/logConfigurationSettings"

import {

  buildProjectDetailFieldsSettings,

  DEFAULT_PROJECT_DETAIL_FIELD_OPTIONS,

  MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS,

  parseProjectDetailFieldsEnabled,

  serializeProjectDetailFieldsEnabled,

  type ManageableProjectDetailFieldKey,

} from "../../../shared/constants/projectDetailFields"

import {

  buildLogDetailFieldsSettings,

  DEFAULT_LOG_DETAIL_FIELD_OPTIONS,

  MANAGEABLE_LOG_DETAIL_FIELD_KEYS,

  parseLogDetailFieldsEnabled,

  serializeLogDetailFieldsEnabled,

  type ManageableLogDetailFieldKey,

} from "../../../shared/constants/logDetailFields"

import {
  CONFIG_MODULE_IDS,
  parseEnabledModuleIds,
} from "../../../shared/constants/configModules"
import {
  ensureModuleSettingsForEnabledModules,
  parseConfigModuleSettings,
} from "../../../shared/constants/configModuleSettings"

import * as templateRepo from "../log-configuration-template/log-configuration-template.repository"

import * as fieldOptionService from "./log-configuration-field-option.service"

import * as configModuleService from "../config-module/config-module.service"

import * as repo from "./log-configuration.repository"



type ConfigRecord = NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>



function resolveProjectDetailOptionsFromGrouped(

  grouped: Record<string, string[]>

): Record<ManageableProjectDetailFieldKey, string[]> {

  return MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS.reduce(

    (acc, key) => {

      const saved = grouped[key]

      acc[key] =

        saved && saved.length > 0 ? [...saved] : [...DEFAULT_PROJECT_DETAIL_FIELD_OPTIONS[key]]

      return acc

    },

    {} as Record<ManageableProjectDetailFieldKey, string[]>

  )

}



function resolveLogDetailOptionsFromGrouped(

  grouped: Record<string, string[]>

): Record<ManageableLogDetailFieldKey, string[]> {

  return MANAGEABLE_LOG_DETAIL_FIELD_KEYS.reduce(

    (acc, key) => {

      const saved = grouped[key]

      acc[key] =

        saved && saved.length > 0 ? [...saved] : [...DEFAULT_LOG_DETAIL_FIELD_OPTIONS[key]]

      return acc

    },

    {} as Record<ManageableLogDetailFieldKey, string[]>

  )

}



async function buildDetailFieldSettings(config: ConfigRecord) {

  const grouped = await fieldOptionService.loadGroupedFieldOptions(config.id)



  return {

    projectDetailFields: buildProjectDetailFieldsSettings(

      parseProjectDetailFieldsEnabled(config.projectDetailFields),

      resolveProjectDetailOptionsFromGrouped(grouped.project_detail)

    ),

    logDetailFields: buildLogDetailFieldsSettings(

      parseLogDetailFieldsEnabled(config.logDetailFields),

      resolveLogDetailOptionsFromGrouped(grouped.log_detail)

    ),

  }

}



async function toDTO(config: ConfigRecord, options: { includeFieldOptions?: boolean } = {}) {

  const includeFieldOptions = options.includeFieldOptions ?? true

  const detailFields = includeFieldOptions

    ? await buildDetailFieldSettings(config)

    : {

        projectDetailFields: buildProjectDetailFieldsSettings(

          parseProjectDetailFieldsEnabled(config.projectDetailFields),

          DEFAULT_PROJECT_DETAIL_FIELD_OPTIONS

        ),

        logDetailFields: buildLogDetailFieldsSettings(

          parseLogDetailFieldsEnabled(config.logDetailFields),

          DEFAULT_LOG_DETAIL_FIELD_OPTIONS

        ),

      }



  return {

    id: String(config.id),

    name: config.name,

    status: config.status,

    templateSlug: config.templateSlug,

    description: config.description,

    coordinateSystem: config.coordinateSystem,

    coordinateSystemUnit: config.coordinateSystemUnit,

    allowCoordinateSystemAtLog: config.allowCoordinateSystemAtLog,

    allowCoordinateSystemAtProject: config.allowCoordinateSystemAtProject,

    autoElevation: config.autoElevation,

    coordinateRequirement: config.coordinateRequirement,

    allowDuplicateProjectNumbers: config.allowDuplicateProjectNumbers,

    measurementSystem: config.measurementSystem,

    dateFormat: config.dateFormat,

    elevationUnit: config.elevationUnit,

    projectDetailFields: detailFields.projectDetailFields,

    logDetailFields: detailFields.logDetailFields,

    enabledModules: parseEnabledModuleIds(config.enabledModules),

    moduleSettings: parseConfigModuleSettings(
      config.moduleSettings,
      parseEnabledModuleIds(config.enabledModules)
    ),

    createdAt: config.createdAt.toISOString(),

    updatedAt: config.updatedAt.toISOString(),

    deletedAt: config.deletedAt?.toISOString() ?? null,

  }

}



async function resolveCreatePayload(
  input: Omit<repo.CreateLogConfigurationInput, "userId">
): Promise<Omit<repo.CreateLogConfigurationInput, "userId">> {
  const templateSlug = input.templateSlug?.trim() || null
  const settings = resolveLogConfigurationSettings(templateSlug)
  let description = input.description ?? ""

  if (templateSlug) {
    const template = await templateRepo.findBySlug(templateSlug)
    if (!template || template.deletedAt) {
      throw new NotFoundError("Log configuration template not found")
    }
    if (!description) {
      description = template.description
    }
  }

  // New configs start with every common module enabled; users manage them later.
  const enabledModules =
    input.enabledModules !== undefined
      ? parseEnabledModuleIds(input.enabledModules)
      : [...CONFIG_MODULE_IDS]
  const moduleSettings = ensureModuleSettingsForEnabledModules(
    enabledModules,
    parseConfigModuleSettings(input.moduleSettings ?? {}, enabledModules)
  )

  return {
    name: input.name,
    status: input.status,
    templateSlug,
    description,
    ...settings,
    enabledModules,
    moduleSettings,
  }
}



async function adoptDefaultModulesForConfig(
  userId: number,
  logConfigurationId: number,
  enabledModules: readonly string[]
) {
  for (const moduleId of enabledModules) {
    try {
      await configModuleService.adoptTemplate(userId, logConfigurationId, moduleId)
    } catch {
      // Skip modules that are unavailable in the catalog; enablement list still stands.
    }
  }
}

/**
 * Legacy configs were created with an empty enabledModules list while the UI still
 * showed every tab. Seed all common modules the first time such a config is loaded,
 * but only when the user has never adopted/unadopted modules for this config.
 */
async function ensureDefaultModulesSeeded(
  userId: number,
  config: ConfigRecord
): Promise<ConfigRecord> {
  const enabled = parseEnabledModuleIds(config.enabledModules)
  if (enabled.length > 0) return config

  const priorModuleRows = await prisma.userModule.count({
    where: {
      userId: config.userId,
      logConfigurationId: config.id,
    },
  })
  if (priorModuleRows > 0) return config

  const enabledModules = [...CONFIG_MODULE_IDS]
  const moduleSettings = ensureModuleSettingsForEnabledModules(
    enabledModules,
    parseConfigModuleSettings(config.moduleSettings, enabledModules)
  )
  const updated = await repo.update(config.id, userId, {
    enabledModules,
    moduleSettings,
  })
  await adoptDefaultModulesForConfig(userId, config.id, enabledModules)
  return updated ?? config
}

export async function ensureDefaultConfigurationsForUser(userId: number) {
  const count = await repo.countForUser(userId)
  if (count > 0) return

  for (const config of DEFAULT_LOG_CONFIGURATIONS) {
    const payload = await resolveCreatePayload({
      name: config.name,
      templateSlug: config.templateSlug,
    })
    const created = await repo.create({ ...payload, userId })
    await fieldOptionService.ensureDefaultFieldOptions(created.id)
    await adoptDefaultModulesForConfig(userId, created.id, payload.enabledModules ?? [])
  }
}



export async function list(filters: repo.LogConfigurationListFilters) {
  await ensureDefaultConfigurationsForUser(filters.userId)

  const result = await repo.findAll(filters)
  const data = await Promise.all(
    result.data.map(async (config) => {
      const seeded = await ensureDefaultModulesSeeded(filters.userId, config)
      return toDTO(seeded, { includeFieldOptions: false })
    })
  )

  return {
    ...result,
    data,
  }
}

export async function getOne(userId: number, id: number) {
  const config = await repo.findByIdForUser(id, userId)
  if (!config || config.deletedAt) throw new NotFoundError("Log configuration not found")
  const seeded = await ensureDefaultModulesSeeded(userId, config)
  return toDTO(seeded)
}



export async function create(
  userId: number,
  input: Omit<repo.CreateLogConfigurationInput, "userId" | keyof LogConfigurationSettings> &
    Partial<LogConfigurationSettings>
) {
  const duplicate = await repo.findByNameForUser(userId, input.name)
  if (duplicate) {
    throw new ConflictError("A log configuration with this name already exists.")
  }

  const payload = await resolveCreatePayload(input)
  const config = await repo.create({ ...payload, userId })
  await fieldOptionService.ensureDefaultFieldOptions(config.id)
  await adoptDefaultModulesForConfig(userId, config.id, payload.enabledModules ?? [])
  return toDTO(config)
}



export async function update(

  userId: number,

  id: number,

  input: repo.UpdateLogConfigurationInput

) {

  const existing = await repo.findByIdForUser(id, userId)

  if (!existing || existing.deletedAt) throw new NotFoundError("Log configuration not found")



  if (input.name !== undefined) {

    const duplicate = await repo.findByNameForUser(userId, input.name, id)

    if (duplicate) {

      throw new ConflictError("A log configuration with this name already exists.")

    }

  }



  const updated = await repo.update(id, userId, input)

  return toDTO(updated)

}



export async function remove(userId: number, id: number) {

  const existing = await repo.findByIdForUser(id, userId)

  if (!existing || existing.deletedAt) throw new NotFoundError("Log configuration not found")

  await repo.softDelete(id, userId)

  return { message: "Log configuration removed" }

}



export async function getDetailFieldSettings(userId: number, id: number) {

  const config = await repo.findByIdForUser(id, userId)

  if (!config || config.deletedAt) throw new NotFoundError("Log configuration not found")

  return buildDetailFieldSettings(config)

}


