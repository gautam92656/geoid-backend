import { ConflictError } from "../../../shared/errors/ConflictError"
import { ForbiddenError } from "../../../shared/errors/ForbiddenError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import {
  DEFAULT_COMMON_CONFIG_MODULES,
  REMOVED_CONFIG_MODULE_SLUGS,
  type ConfigModuleTag,
} from "../../../shared/constants/configModuleCatalog"
import {
  createDefaultModuleSettings,
  parseStoredModuleSettings,
  type StoredModuleSettings,
} from "../../../shared/constants/configModuleSettings"
import * as repo from "./config-module.repository"
import * as workflowService from "./config-module.workflow.service"
import * as originService from "./config-module.origin.service"
import * as dataTypeOptionService from "./config-module.dataTypeOption.service"
import * as insituTestTypeService from "./config-module.insituTestType.service"
import * as insituUnitSettingService from "./config-module.insituUnitSetting.service"
import * as coreDefectTypeService from "./config-module.coreDefectType.service"
import * as apertureColorService from "./config-module.apertureColor.service"
import * as apertureMineralService from "./config-module.apertureMineral.service"
import * as infillMaterialService from "./config-module.infillMaterial.service"
import * as surfaceShapeService from "./config-module.surfaceShape.service"
import * as surfaceRoughnessService from "./config-module.surfaceRoughness.service"
import * as defectOpennessService from "./config-module.defectOpenness.service"
import * as defectCoatingService from "./config-module.defectCoating.service"
import * as remarkTypeService from "./config-module.remarkType.service"
import * as remarksQuickNoteService from "./config-module.remarksQuickNote.service"
import * as drillingTypeService from "./config-module.drillingType.service"
import * as drillingResistanceService from "./config-module.drillingResistance.service"
import * as drillingObservationService from "./config-module.drillingObservation.service"
import * as drillingCasingService from "./config-module.drillingCasing.service"
import * as waterObservationTypeService from "./config-module.waterObservationType.service"
import * as wellTypeService from "./config-module.wellType.service"
import * as wellCasingTypeService from "./config-module.wellCasingType.service"
import * as wellCasingTopService from "./config-module.wellCasingTop.service"
import * as wellCoverTypeService from "./config-module.wellCoverType.service"
import * as wellProbeTypeService from "./config-module.wellProbeType.service"
import * as wellBackfillTypeService from "./config-module.wellBackfillType.service"
import * as wellDefaultWellIdService from "./config-module.wellDefaultWellId.service"
import * as sampleTypeService from "./config-module.sampleType.service"
import * as labTestTypeService from "./config-module.labTestType.service"
import * as labTestPresetService from "./config-module.labTestPreset.service"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import type { ModuleRecord } from "./config-module.repository"

function templateIdFor(module: ModuleRecord): string {
  return module.sourceSlug?.trim() || module.slug
}

function toDTO(module: ModuleRecord) {
  const templateId = templateIdFor(module)
  const settings =
    module.scope === "user"
      ? repo.parseModuleSettingsField(module.settings, templateId) ??
        createDefaultModuleSettings(templateId)
      : null

  return {
    /** Enablement / config key — template slug for user copies. */
    id: templateId,
    recordId: module.id,
    slug: module.slug,
    sourceSlug: module.sourceSlug,
    title: module.title,
    description: module.description,
    tags: repo.parseStoredTags(module.tags) as ConfigModuleTag[],
    filterCategories: module.filterCategories,
    scope: module.scope,
    logConfigurationId: module.logConfigurationId,
    settings,
    available: module.isAvailable,
    sortOrder: module.sortOrder,
    createdAt: module.createdAt.toISOString(),
    updatedAt: module.updatedAt.toISOString(),
    deletedAt: module.deletedAt?.toISOString() ?? null,
  }
}

export async function syncDefaultCommonModules() {
  for (const module of DEFAULT_COMMON_CONFIG_MODULES) {
    await repo.upsertCommon({
      slug: module.slug,
      title: module.title,
      description: module.description,
      tags: [...module.tags],
      filterCategories: [...module.filterCategories],
      isAvailable: module.isAvailable,
      sortOrder: module.sortOrder,
    })
  }

  await repo.softDeleteCommonBySlugs(REMOVED_CONFIG_MODULE_SLUGS)
}

export async function list(filters: repo.ConfigModuleListFilters) {
  await syncDefaultCommonModules()
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(id: number, userId: number) {
  const module = await repo.findByIdForUser(id, userId)
  if (!module || module.deletedAt) throw new NotFoundError("Log configuration module not found")
  return toDTO(module)
}

export async function createUserModule(
  actorUserId: number,
  input: {
    logConfigurationId: number
    slug: string
    title: string
    description: string
    tags: ConfigModuleTag[]
    filterCategories: string[]
    sourceSlug?: string | null
    settings?: StoredModuleSettings | null
    isAvailable?: boolean
    sortOrder?: number
  }
) {
  const { ownerUserId, logConfigurationId } = await assertAccessibleLogConfiguration(
    actorUserId,
    input.logConfigurationId
  )

  const duplicate = await repo.findUserModuleBySlug(ownerUserId, logConfigurationId, input.slug)
  if (duplicate) {
    throw new ConflictError("A module with this slug already exists.")
  }

  if (input.sourceSlug) {
    const existing = await repo.findUserModuleBySourceSlug(
      ownerUserId,
      logConfigurationId,
      input.sourceSlug
    )
    if (existing && !existing.deletedAt) {
      throw new ConflictError("You already have a customization for this module template.")
    }
  }

  const templateId = input.sourceSlug?.trim() || input.slug
  const settings =
    input.settings != null
      ? parseStoredModuleSettings(input.settings, templateId)
      : createDefaultModuleSettings(templateId)

  const module = await repo.createUserModule(ownerUserId, {
    ...input,
    logConfigurationId,
    settings,
  })
  return toDTO(module)
}

/**
 * Adopt a common template as a per-log-configuration customization (idempotent).
 * Stored in `user_modules`, not the shared catalog.
 */
export async function adoptTemplate(
  actorUserId: number,
  logConfigurationId: number,
  templateSlug: string
) {
  const access = await assertAccessibleLogConfiguration(actorUserId, logConfigurationId)
  const { ownerUserId } = access
  const configId = access.logConfigurationId
  await syncDefaultCommonModules()

  const slug = templateSlug.trim()
  if ((REMOVED_CONFIG_MODULE_SLUGS as readonly string[]).includes(slug)) {
    throw new NotFoundError("Module template not found")
  }

  const existing = await repo.findUserModuleBySourceSlug(ownerUserId, configId, slug, {
    includeDeleted: true,
  })
  if (existing && !existing.deletedAt) {
    return toDTO(existing)
  }

  const template = await repo.findCommonBySlug(slug)
  if (!template || template.deletedAt || !template.isAvailable) {
    throw new NotFoundError("Module template not found")
  }

  const settings = createDefaultModuleSettings(slug)
  const module =
    existing && existing.deletedAt
      ? await repo.restoreUserModule(existing.id, ownerUserId, {
          title: template.title,
          description: template.description,
          settings,
          isAvailable: true,
          sortOrder: template.sortOrder,
        })
      : await repo.createUserModule(ownerUserId, {
          logConfigurationId: configId,
          slug: repo.buildUserModuleSlug(ownerUserId, configId, slug),
          title: template.title,
          description: template.description,
          tags: repo.parseStoredTags(template.tags),
          filterCategories: [...template.filterCategories],
          sourceSlug: slug,
          settings,
          isAvailable: true,
          sortOrder: template.sortOrder,
        })

  if (!module) {
    throw new NotFoundError("Log configuration module not found")
  }

  if (slug === "subsurfaces") {
    await workflowService.ensureUserWorkflow(actorUserId, configId, slug)
    await originService.ensureUserOriginOptions(actorUserId, configId, slug)
    await dataTypeOptionService.ensureAllUserDataTypeOptions(actorUserId, configId, slug)
  }

  if (slug === "insitu-tests-usa") {
    await insituTestTypeService.ensureUserInsituTestTypes(actorUserId, configId, slug)
    await insituUnitSettingService.ensureUserInsituUnitSettings(actorUserId, configId, slug)
  }

  if (slug === "core-logging") {
    await coreDefectTypeService.ensureUserCoreDefectTypes(actorUserId, configId, slug)
    await apertureColorService.ensureUserApertureColors(actorUserId, configId, slug)
    await apertureMineralService.ensureUserApertureMinerals(actorUserId, configId, slug)
    await infillMaterialService.ensureUserInfillMaterials(actorUserId, configId, slug)
    await surfaceShapeService.ensureUserSurfaceShapes(actorUserId, configId, slug)
    await surfaceRoughnessService.ensureUserSurfaceRoughnesses(actorUserId, configId, slug)
    await defectOpennessService.ensureUserDefectOpennesses(actorUserId, configId, slug)
    await defectCoatingService.ensureUserDefectCoatings(actorUserId, configId, slug)
  }

  if (slug === "log-remarks") {
    await remarkTypeService.ensureUserRemarkTypes(actorUserId, configId, slug)
    await remarksQuickNoteService.ensureUserRemarksQuickNotes(actorUserId, configId, slug)
  }

  if (slug === "drilling-observations") {
    await drillingTypeService.ensureUserDrillingTypes(actorUserId, configId, slug)
    await drillingResistanceService.ensureUserDrillingResistances(actorUserId, configId, slug)
    await drillingObservationService.ensureUserDrillingObservations(actorUserId, configId, slug)
    await drillingCasingService.ensureUserDrillingCasings(actorUserId, configId, slug)
  }

  if (slug === "water-observations") {
    await waterObservationTypeService.ensureUserWaterObservationTypes(
      actorUserId,
      configId,
      slug
    )
  }

  if (slug === "well-logs") {
    await wellTypeService.ensureUserWellTypes(actorUserId, configId, slug)
    await wellCasingTypeService.ensureUserWellCasingTypes(actorUserId, configId, slug)
    await wellCasingTopService.ensureUserWellCasingTops(actorUserId, configId, slug)
    await wellCoverTypeService.ensureUserWellCoverTypes(actorUserId, configId, slug)
    await wellProbeTypeService.ensureUserWellProbeTypes(actorUserId, configId, slug)
    await wellBackfillTypeService.ensureUserWellBackfillTypes(actorUserId, configId, slug)
    await wellDefaultWellIdService.ensureUserWellDefaultWellIds(actorUserId, configId, slug)
  }

  if (slug === "samples") {
    await sampleTypeService.ensureUserSampleTypes(actorUserId, configId, slug)
  }

  if (slug === "lab-tests") {
    await labTestTypeService.ensureUserLabTestTypes(actorUserId, configId, slug)
    await labTestPresetService.ensureUserLabTestPresets(actorUserId, configId, slug)
  }

  return toDTO(module)
}

export async function updateUserModule(
  id: number,
  userId: number,
  input: {
    slug?: string
    title?: string
    description?: string
    tags?: ConfigModuleTag[]
    filterCategories?: string[]
    settings?: StoredModuleSettings | null
    isAvailable?: boolean
    sortOrder?: number
  }
) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Log configuration module not found")
  }
  if (existing.scope !== "user" || existing.userId !== userId) {
    throw new ForbiddenError("Only your custom modules can be updated.")
  }

  if (input.slug !== undefined && existing.logConfigurationId != null) {
    const duplicate = await repo.findUserModuleBySlug(
      userId,
      existing.logConfigurationId,
      input.slug
    )
    if (duplicate && duplicate.id !== id) {
      throw new ConflictError("A module with this slug already exists.")
    }
  }

  const templateId = existing.sourceSlug?.trim() || existing.slug
  const payload: Parameters<typeof repo.updateUserModule>[2] = { ...input }
  if (input.settings !== undefined) {
    payload.settings =
      input.settings == null ? null : parseStoredModuleSettings(input.settings, templateId)
  }

  try {
    const updated = await repo.updateUserModule(id, userId, payload)
    return toDTO(updated)
  } catch (err) {
    if (err instanceof Error && err.message === "USER_MODULE_NOT_FOUND") {
      throw new NotFoundError("Log configuration module not found")
    }
    throw err
  }
}

/** Persist config-scoped settings for a template the user has adopted. */
export async function syncUserModuleSettings(
  actorUserId: number,
  logConfigurationId: number,
  templateSlug: string,
  settings: StoredModuleSettings
) {
  const { ownerUserId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )
  const adopted = await adoptTemplate(actorUserId, logConfigurationId, templateSlug)
  const templateId = adopted.sourceSlug || adopted.id
  const parsed = parseStoredModuleSettings(settings, templateId)
  const updated = await repo.updateUserModule(adopted.recordId, ownerUserId, {
    settings: parsed,
    title: parsed.moduleName?.trim() || adopted.title,
  })
  return toDTO(updated)
}

export async function syncManyUserModuleSettings(
  userId: number,
  logConfigurationId: number,
  modules: Record<string, StoredModuleSettings>
) {
  const results = []
  for (const [templateSlug, settings] of Object.entries(modules)) {
    results.push(
      await syncUserModuleSettings(userId, logConfigurationId, templateSlug, settings)
    )
  }
  return results
}

export async function removeUserModule(id: number, userId: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Log configuration module not found")
  }
  if (existing.scope !== "user" || existing.userId !== userId) {
    throw new ForbiddenError("Only your custom modules can be removed.")
  }

  await repo.softDeleteUserModule(id, userId)
  return { message: "Log configuration module removed" }
}

/**
 * Soft-delete the configuration-scoped user copy of a common template
 * (idempotent). Does not modify log-configuration enabledModules — the
 * client persists that separately, matching adopt.
 */
export async function unadoptTemplate(
  actorUserId: number,
  logConfigurationId: number,
  templateSlug: string
) {
  const access = await assertAccessibleLogConfiguration(actorUserId, logConfigurationId)
  const { ownerUserId } = access
  const configId = access.logConfigurationId

  const slug = templateSlug.trim()
  if (!slug) {
    throw new NotFoundError("Module template not found")
  }

  const existing = await repo.findUserModuleBySourceSlug(ownerUserId, configId, slug)
  if (!existing || existing.deletedAt) {
    return { message: "Log configuration module removed", removed: false }
  }

  await repo.softDeleteUserModule(existing.id, ownerUserId)
  return { message: "Log configuration module removed", removed: true }
}
