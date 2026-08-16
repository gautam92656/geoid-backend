import { CONFIG_MODULE_IDS } from "./configModules"
import { getModuleInsituTestTypeDefaults } from "./insituTestTypeDefaults"
import { INSITU_TESTS_MODULE_SLUG } from "./insituTestTypeTypes"
import {
  getModuleApertureColorDefaults,
  getModuleApertureMineralDefaults,
  getModuleCoreDefectTypeDefaults,
  getModuleInfillMaterialDefaults,
  getModuleSurfaceShapeDefaults,
  getModuleSurfaceRoughnessDefaults,
  getModuleDefectOpennessDefaults,
  getModuleDefectCoatingDefaults,
} from "./coreLoggingOptionDefaults"
import {
  APERTURE_COLORS_DATA_TYPE_ID,
  APERTURE_MINERALS_DATA_TYPE_ID,
  CORE_DEFECT_TYPES_DATA_TYPE_ID,
  CORE_LOGGING_MODULE_SLUG,
  INFILL_MATERIALS_DATA_TYPE_ID,
  SURFACE_SHAPES_DATA_TYPE_ID,
  SURFACE_ROUGHNESSES_DATA_TYPE_ID,
  DEFECT_OPENNESSES_DATA_TYPE_ID,
  DEFECT_COATINGS_DATA_TYPE_ID,
} from "./coreLoggingOptionTypes"
import {
  getModuleRemarkTypeDefaults,
  getModuleRemarksQuickNoteDefaults,
} from "./logRemarksOptionDefaults"
import {
  LOG_REMARKS_MODULE_SLUG,
  REMARK_TYPES_DATA_TYPE_ID,
  REMARKS_QUICK_NOTES_DATA_TYPE_ID,
} from "./logRemarksOptionTypes"

export const LOG_REMARKS_MODULE_ID = "log-remarks" as const

export const MODULE_DISPLAY_NAME_MAX_LENGTH = 100
export const MODULE_OPTION_NAME_MAX_LENGTH = 200
export const MODULE_OPTIONS_MAX_COUNT = 100
export const WORKFLOW_NAME_MAX_LENGTH = 200
export const WORKFLOW_STEPS_MAX_COUNT = 200

export const MODULE_STATUSES = ["active", "inactive"] as const
export type ModuleStatus = (typeof MODULE_STATUSES)[number]

export const WORKFLOW_STEP_TYPES = ["element", "variation"] as const
export type WorkflowStepType = (typeof WORKFLOW_STEP_TYPES)[number]

export type ModuleNamedOption = {
  id: string
  name: string
  code?: string | null
  abbreviation?: string | null
  graphic?: string | null
  rockGroup?: string | null
  color?: string | null
  overlayColor?: string | null
  textColor?: string | null
  showAutoScale?: boolean
  type?: string
  tablogsAlias?: string | null
  allowNegativeDepth?: boolean
  graphicAlignment?: "top" | "bottom"
  depthRequired?: boolean
  startGraphic?: string | null
  endGraphic?: string | null
  active?: boolean
  enableSegregatedGraphic?: boolean
  topGraphic?: string | null
  bottomGraphic?: string | null
  depthFrequencyEnabled?: boolean
  depthFrequency?: string | null
  enableSampleLogging?: boolean
  enableSubsurfaceLogging?: boolean
  defaultSampleTypeId?: string | null
  enableAutoSampleDescription?: boolean
  settings?: unknown
  sampleAbbreviation?: string | null
  noteRecovery?: boolean
  displayQcId?: boolean
  enableAssignLabTest?: boolean
  enableInsituTestLogging?: boolean
  defaultInsituTestTypeId?: string | null
  splitGraphic?: boolean
  /** Lab test preset: selected lab test type ids */
  labTestTypeIds?: string[]
  /** Lab test type: optional external alias */
  externalAlias?: string | null
  /** Lab test type: selected alias table name */
  aliasTable?: string | null
  /** Lab test type: include in selected data-plot borelogs */
  addAsSelectedDataPlot?: boolean
  /** Lab test type: result table design columns */
  labTestResultFields?: Array<{
    id: string
    name: string
    externalAlias?: string | null
    tablogsAlias?: string | null
  }>
  /** Remarks quick note: parent remark type id */
  remarkTypeId?: string | null
}

export type ModuleGeneralSettings = {
  moduleName: string
  status: ModuleStatus
  showOnWeb: boolean
  showOnMobile: boolean
}

export type StoredModuleSettings = ModuleGeneralSettings & {
  dataTypeOptions: Record<string, ModuleNamedOption[]>
} & Record<string, unknown>

const STORED_MODULE_CORE_KEYS = new Set([
  "moduleName",
  "displayName",
  "status",
  "showOnWeb",
  "showOnMobile",
  "remarkTypes",
  "dataTypeOptions",
])

function extractModuleExtras(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {}
  const extras: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (!STORED_MODULE_CORE_KEYS.has(key)) {
      extras[key] = entry
    }
  }
  return extras
}

export const WORKFLOW_FIELD_INPUT_TYPES = [
  "number",
  "checkbox",
  "options",
  "note",
  "color",
  "text",
] as const
export type WorkflowFieldInputType = (typeof WORKFLOW_FIELD_INPUT_TYPES)[number]

export const WORKFLOW_STEP_CONDITION_TYPES = ["enable", "disable", "show", "hide"] as const
export type WorkflowStepConditionType = (typeof WORKFLOW_STEP_CONDITION_TYPES)[number]

export type WorkflowStepCondition = {
  type: WorkflowStepConditionType
  field: string
  value: string | boolean | number
  searchTerm?: string
  isOriginType?: boolean
  isRockGroup?: boolean
}

export type WorkflowStepOption = {
  id: string
  name: string
  value: string
  visible?: boolean
  group?: string
  rockGroup?: string
  abbreviation?: string
  isDefault?: boolean
  conditions?: WorkflowStepCondition[]
}

export type WorkflowStep = {
  id: string
  name: string
  type: WorkflowStepType
  fieldName?: string
  inputType?: WorkflowFieldInputType
  databaseField?: string
  required?: boolean
  unit?: string
  optionSet?: string | null
  options?: WorkflowStepOption[]
  conditions?: WorkflowStepCondition[]
  multipleOptions?: boolean
  maxOptionsSelected?: number
  allowFreeText?: boolean
  conditionsOperator?: "AND" | "OR"
  instructions?: string
}

export type WorkflowSettings = {
  enabled: boolean
  name: string
  ignoreParentLegacySettings?: boolean
  steps: WorkflowStep[]
  applyClassificationRules?: boolean
  classificationCodes?: unknown[]
}

export type ConfigModuleSettings = {
  order: string[]
  modules: Partial<Record<string, StoredModuleSettings>>
  workflow: WorkflowSettings
}

export const MODULE_DATA_TYPE_IDS_BY_MODULE: Record<string, string[]> = {
  subsurfaces: [
    "origin",
    "finish-reasons",
    "rock_type",
    "non_soil_type",
    "rock_texture",
    "colors",
    "geomodal_layer",
  ],
  "insitu-tests-usa": ["testing-types"],
  "log-remarks": ["remark-types", "remarks-quick-notes"],
  "drilling-observations": [
    "drilling-types",
    "drilling-resistances",
    "drilling-observations",
    "drilling-casings",
  ],
  "water-observations": ["water-observation-types"],
  "well-logs": [
    "well-types",
    "well-casing-types",
    "well-cover-types",
    "well-probe-types",
    "well-casing-tops",
    "well-backfill-types",
  ],
  "core-logging": [
    "core-defect-types",
    "aperture-colors",
    "aperture-minerals",
    "infill-materials",
    "surface-shapes",
    "surface-roughnesses",
    "defect-opennesses",
    "defect-coatings",
  ],
  samples: ["sample-types", "sample-ids"],
  "lab-tests": ["lab-test-types", "lab-test-presets"],
}

export const DEFAULT_MODULE_DISPLAY_NAMES: Record<string, string> = {
  "insitu-tests-usa": "Insitu Tests",
  "core-logging": "Core Logging",
  "log-report": "Log Report",
  "log-remarks": "Remarks",
  subsurfaces: "Subsurface",
  "drilling-observations": "Drilling Observations",
  "water-observations": "Water Observations",
  "well-logs": "Well Logs",
  samples: "Samples",
  "lab-tests": "Lab Tests",
}

const DEFAULT_REMARK_TYPES: ModuleNamedOption[] = [
  { id: "logged-remarks", name: "Logged Remarks", tablogsAlias: "logged-remarks" },
  { id: "unlogged-remarks", name: "Unlogged Remarks", tablogsAlias: "unlogged-remarks" },
  { id: "l-pile-value", name: "L-Pile Value", tablogsAlias: "l-pile-value" },
  { id: "remarks", name: "Remarks", tablogsAlias: "remarks" },
]

export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettings = {
  enabled: true,
  name: "ASTM Enviro Workflow",
  ignoreParentLegacySettings: true,
  steps: [],
  applyClassificationRules: true,
  classificationCodes: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function parseNamedOption(value: unknown, index: number): ModuleNamedOption | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name || name.length > MODULE_OPTION_NAME_MAX_LENGTH) return null
  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : `option-${index + 1}`

  const option: ModuleNamedOption = { id, name }

  const code = asNullableString(value.code) ?? asNullableString(value.abbreviation)
  if (code !== null || value.code === null || value.abbreviation === null) {
    option.code = code
    option.abbreviation = asNullableString(value.abbreviation) ?? code
  }

  const graphic = asNullableString(value.graphic)
  if (graphic !== null || value.graphic === null) option.graphic = graphic

  const rockGroup =
    asNullableString(value.rockGroup) ?? asNullableString(value.rock_group)
  if (rockGroup !== null || value.rockGroup === null || value.rock_group === null) {
    option.rockGroup = rockGroup
  }

  const color = asNullableString(value.color)
  if (color !== null || value.color === null) option.color = color

  const overlayColor =
    asNullableString(value.overlayColor) ?? asNullableString(value.overlay_color)
  if (
    overlayColor !== null ||
    value.overlayColor === null ||
    value.overlay_color === null
  ) {
    option.overlayColor = overlayColor
  }

  const textColor =
    asNullableString(value.textColor) ?? asNullableString(value.text_color)
  if (textColor !== null || value.textColor === null || value.text_color === null) {
    option.textColor = textColor
  }

  if (typeof value.showAutoScale === "boolean") {
    option.showAutoScale = value.showAutoScale
  } else if (typeof value.show_auto_scale === "boolean") {
    option.showAutoScale = value.show_auto_scale
  }

  if (typeof value.type === "string" && value.type.trim()) {
    option.type = value.type.trim()
  }

  const tablogsAlias =
    asNullableString(value.tablogsAlias) ?? asNullableString(value.tablogs_alias)
  if (
    tablogsAlias !== null ||
    value.tablogsAlias === null ||
    value.tablogs_alias === null
  ) {
    option.tablogsAlias = tablogsAlias
  }

  if (typeof value.allowNegativeDepth === "boolean") {
    option.allowNegativeDepth = value.allowNegativeDepth
  } else if (typeof value.allow_negative_depth === "boolean") {
    option.allowNegativeDepth = value.allow_negative_depth
  } else if (typeof value.allow_negative_depth === "number") {
    option.allowNegativeDepth = value.allow_negative_depth !== 0
  }

  const graphicAlignmentRaw =
    asNullableString(value.graphicAlignment) ?? asNullableString(value.graphic_alignment)
  if (graphicAlignmentRaw) {
    const normalized = graphicAlignmentRaw.toLowerCase()
    if (normalized === "top" || normalized === "bottom") {
      option.graphicAlignment = normalized
    }
  }

  if (typeof value.depthRequired === "boolean") {
    option.depthRequired = value.depthRequired
  } else if (typeof value.depth_required === "boolean") {
    option.depthRequired = value.depth_required
  } else if (typeof value.depth_required === "number") {
    option.depthRequired = value.depth_required !== 0
  }

  const startGraphic =
    asNullableString(value.startGraphic) ?? asNullableString(value.start_graphic)
  if (
    startGraphic !== null ||
    value.startGraphic === null ||
    value.start_graphic === null
  ) {
    option.startGraphic = startGraphic
  }

  const endGraphic =
    asNullableString(value.endGraphic) ?? asNullableString(value.end_graphic)
  if (endGraphic !== null || value.endGraphic === null || value.end_graphic === null) {
    option.endGraphic = endGraphic
  }

  if (typeof value.active === "boolean") {
    option.active = value.active
  }

  if (typeof value.enableSegregatedGraphic === "boolean") {
    option.enableSegregatedGraphic = value.enableSegregatedGraphic
  } else if (typeof value.enable_segregated_graphic === "boolean") {
    option.enableSegregatedGraphic = value.enable_segregated_graphic
  } else if (typeof value.splitGraphic === "boolean") {
    option.enableSegregatedGraphic = value.splitGraphic
  } else if (typeof value.split_graphic === "boolean") {
    option.enableSegregatedGraphic = value.split_graphic
  }

  if (typeof value.splitGraphic === "boolean") {
    option.splitGraphic = value.splitGraphic
  } else if (typeof value.split_graphic === "boolean") {
    option.splitGraphic = value.split_graphic
  } else if (typeof option.enableSegregatedGraphic === "boolean") {
    option.splitGraphic = option.enableSegregatedGraphic
  }

  const topGraphic =
    asNullableString(value.topGraphic) ?? asNullableString(value.top_graphic)
  if (topGraphic !== null || value.topGraphic === null || value.top_graphic === null) {
    option.topGraphic = topGraphic
  }

  const bottomGraphic =
    asNullableString(value.bottomGraphic) ?? asNullableString(value.bottom_graphic)
  if (
    bottomGraphic !== null ||
    value.bottomGraphic === null ||
    value.bottom_graphic === null
  ) {
    option.bottomGraphic = bottomGraphic
  }

  if (typeof value.depthFrequencyEnabled === "boolean") {
    option.depthFrequencyEnabled = value.depthFrequencyEnabled
  } else if (typeof value.depth_frequency_enabled === "boolean") {
    option.depthFrequencyEnabled = value.depth_frequency_enabled
  }

  const depthFrequency =
    asNullableString(value.depthFrequency) ?? asNullableString(value.depth_frequency)
  if (
    depthFrequency !== null ||
    value.depthFrequency === null ||
    value.depth_frequency === null
  ) {
    option.depthFrequency = depthFrequency
  }

  if (typeof value.enableSampleLogging === "boolean") {
    option.enableSampleLogging = value.enableSampleLogging
  } else if (typeof value.enable_sample_logging === "boolean") {
    option.enableSampleLogging = value.enable_sample_logging
  }

  if (typeof value.enableSubsurfaceLogging === "boolean") {
    option.enableSubsurfaceLogging = value.enableSubsurfaceLogging
  } else if (typeof value.enable_subsurface_logging === "boolean") {
    option.enableSubsurfaceLogging = value.enable_subsurface_logging
  } else if (typeof value.enable_subsurface === "boolean") {
    option.enableSubsurfaceLogging = value.enable_subsurface
  } else if (typeof value.enable_subsurface === "number") {
    option.enableSubsurfaceLogging = value.enable_subsurface !== 0
  }

  const defaultSampleTypeId =
    asNullableString(value.defaultSampleTypeId) ??
    asNullableString(value.default_sample_type_id)
  if (
    defaultSampleTypeId !== null ||
    value.defaultSampleTypeId === null ||
    value.default_sample_type_id === null
  ) {
    option.defaultSampleTypeId = defaultSampleTypeId
  }

  if (typeof value.enableAutoSampleDescription === "boolean") {
    option.enableAutoSampleDescription = value.enableAutoSampleDescription
  } else if (typeof value.enable_auto_sample_description === "boolean") {
    option.enableAutoSampleDescription = value.enable_auto_sample_description
  }

  const sampleAbbreviation =
    asNullableString(value.sampleAbbreviation) ??
    asNullableString(value.sample_abbreviation)
  if (
    sampleAbbreviation !== null ||
    value.sampleAbbreviation === null ||
    value.sample_abbreviation === null
  ) {
    option.sampleAbbreviation = sampleAbbreviation
  }

  if (typeof value.noteRecovery === "boolean") {
    option.noteRecovery = value.noteRecovery
  } else if (typeof value.note_recovery === "boolean") {
    option.noteRecovery = value.note_recovery
  } else if (typeof value.note_recovery === "number") {
    option.noteRecovery = value.note_recovery !== 0
  }

  if (typeof value.displayQcId === "boolean") {
    option.displayQcId = value.displayQcId
  } else if (typeof value.display_qc_id === "boolean") {
    option.displayQcId = value.display_qc_id
  } else if (typeof value.display_qc_id === "number") {
    option.displayQcId = value.display_qc_id !== 0
  }

  if (typeof value.enableAssignLabTest === "boolean") {
    option.enableAssignLabTest = value.enableAssignLabTest
  } else if (typeof value.enable_assign_lab_test === "boolean") {
    option.enableAssignLabTest = value.enable_assign_lab_test
  } else if (typeof value.enable_assign_lab_test === "number") {
    option.enableAssignLabTest = value.enable_assign_lab_test !== 0
  }

  if (typeof value.enableInsituTestLogging === "boolean") {
    option.enableInsituTestLogging = value.enableInsituTestLogging
  } else if (typeof value.enable_insitu_test_logging === "boolean") {
    option.enableInsituTestLogging = value.enable_insitu_test_logging
  } else if (typeof value.enable_insitu === "boolean") {
    option.enableInsituTestLogging = value.enable_insitu
  } else if (typeof value.enable_insitu === "number") {
    option.enableInsituTestLogging = value.enable_insitu !== 0
  }

  const defaultInsituTestTypeId =
    asNullableString(value.defaultInsituTestTypeId) ??
    asNullableString(value.default_insitu_test_type_id) ??
    asNullableString(value.situ_test_id) ??
    (typeof value.situ_test_id === "number" ? String(value.situ_test_id) : null)
  if (
    defaultInsituTestTypeId !== null ||
    value.defaultInsituTestTypeId === null ||
    value.default_insitu_test_type_id === null ||
    value.situ_test_id === null
  ) {
    option.defaultInsituTestTypeId = defaultInsituTestTypeId
  }

  const labTestTypeIdsSource =
    value.labTestTypeIds ?? value.lab_test_type_ids ?? value.labTestTypes ?? value.lab_test_types
  if (Array.isArray(labTestTypeIdsSource)) {
    const ids: string[] = []
    const seen = new Set<string>()
    for (const entry of labTestTypeIdsSource) {
      if (typeof entry !== "string") continue
      const id = entry.trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      ids.push(id)
    }
    option.labTestTypeIds = ids
  }

  const externalAlias =
    asNullableString(value.externalAlias) ?? asNullableString(value.external_alias)
  if (
    externalAlias !== null ||
    value.externalAlias === null ||
    value.external_alias === null
  ) {
    option.externalAlias = externalAlias
  }

  const aliasTable =
    asNullableString(value.aliasTable) ?? asNullableString(value.alias_table)
  if (aliasTable !== null || value.aliasTable === null || value.alias_table === null) {
    option.aliasTable = aliasTable
  }

  if (typeof value.addAsSelectedDataPlot === "boolean") {
    option.addAsSelectedDataPlot = value.addAsSelectedDataPlot
  } else if (typeof value.add_as_selected_data_plot === "boolean") {
    option.addAsSelectedDataPlot = value.add_as_selected_data_plot
  } else if (typeof value.add_as_selected_data_plot === "number") {
    option.addAsSelectedDataPlot = value.add_as_selected_data_plot !== 0
  }

  const resultFieldsSource =
    value.labTestResultFields ??
    value.lab_test_result_fields ??
    value.resultFields ??
    value.result_fields
  if (Array.isArray(resultFieldsSource)) {
    const fields: NonNullable<ModuleNamedOption["labTestResultFields"]> = []
    for (const [index, entry] of resultFieldsSource.entries()) {
      if (!isRecord(entry) || fields.length >= MODULE_OPTIONS_MAX_COUNT) continue
      const fieldName = typeof entry.name === "string" ? entry.name : ""
      const fieldId =
        typeof entry.id === "string" && entry.id.trim()
          ? entry.id.trim()
          : `lab-result-field-${index + 1}`
      fields.push({
        id: fieldId,
        name: fieldName,
        externalAlias:
          asNullableString(entry.externalAlias) ?? asNullableString(entry.external_alias),
        tablogsAlias:
          asNullableString(entry.tablogsAlias) ?? asNullableString(entry.tablogs_alias),
      })
    }
    option.labTestResultFields = fields
  }

  const remarkTypeId =
    asNullableString(value.remarkTypeId) ?? asNullableString(value.remark_type_id)
  if (
    remarkTypeId !== null ||
    value.remarkTypeId === null ||
    value.remark_type_id === null
  ) {
    option.remarkTypeId = remarkTypeId
  }

  return option
}

function parseNamedOptions(value: unknown, fallback: ModuleNamedOption[] = []): ModuleNamedOption[] {
  if (!Array.isArray(value)) return fallback.map((entry) => ({ ...entry }))

  const options: ModuleNamedOption[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    if (options.length >= MODULE_OPTIONS_MAX_COUNT) break
    const parsed = parseNamedOption(entry, index)
    if (!parsed) continue
    const key = parsed.remarkTypeId
      ? `${parsed.remarkTypeId}::${parsed.name.toLowerCase()}`
      : parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function createDefaultModuleGeneralSettings(moduleId: string): ModuleGeneralSettings {
  return {
    moduleName: DEFAULT_MODULE_DISPLAY_NAMES[moduleId] ?? moduleId,
    status: "active",
    showOnWeb: true,
    showOnMobile: moduleId === "log-report" ? false : true,
  }
}

function toInsituTestTypeNamedOption(
  entry: ReturnType<typeof getModuleInsituTestTypeDefaults>[number]
): ModuleNamedOption {
  return {
    id: entry.id,
    name: entry.name,
    active: entry.active ?? true,
    graphic: entry.graphic ?? "graphic_00.png",
    enableSegregatedGraphic: entry.enableSegregatedGraphic ?? false,
    topGraphic: entry.topGraphic ?? null,
    bottomGraphic: entry.bottomGraphic ?? null,
    depthFrequencyEnabled: entry.depthFrequencyEnabled ?? false,
    depthFrequency: entry.depthFrequency ?? null,
    enableSampleLogging: entry.enableSampleLogging ?? false,
    enableSubsurfaceLogging: entry.enableSubsurfaceLogging ?? false,
    defaultSampleTypeId: entry.defaultSampleTypeId ?? null,
    enableAutoSampleDescription: entry.enableAutoSampleDescription ?? false,
    settings: entry.settings ?? { otherSettings: [] },
  }
}

function createDefaultDataTypeOptions(moduleId: string): Record<string, ModuleNamedOption[]> {
  const options: Record<string, ModuleNamedOption[]> = {}
  for (const dataTypeId of MODULE_DATA_TYPE_IDS_BY_MODULE[moduleId] ?? []) {
    if (moduleId === INSITU_TESTS_MODULE_SLUG && dataTypeId === "testing-types") {
      options[dataTypeId] = getModuleInsituTestTypeDefaults(moduleId).map(
        toInsituTestTypeNamedOption
      )
      continue
    }
    if (moduleId === CORE_LOGGING_MODULE_SLUG) {
      if (dataTypeId === CORE_DEFECT_TYPES_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleCoreDefectTypeDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          code: entry.code ?? null,
          graphic: entry.graphic ?? null,
          defaultSampleTypeId: entry.defaultSampleTypeId ?? null,
        }))
        continue
      }
      if (dataTypeId === APERTURE_COLORS_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleApertureColorDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          color: entry.color ?? null,
          textColor: entry.textColor ?? null,
        }))
        continue
      }
      if (dataTypeId === APERTURE_MINERALS_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleApertureMineralDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          code: entry.code ?? null,
        }))
        continue
      }
      if (dataTypeId === INFILL_MATERIALS_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleInfillMaterialDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          code: entry.code ?? null,
        }))
        continue
      }
      if (dataTypeId === SURFACE_SHAPES_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleSurfaceShapeDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          code: entry.code ?? null,
        }))
        continue
      }
      if (dataTypeId === SURFACE_ROUGHNESSES_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleSurfaceRoughnessDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          code: entry.code ?? null,
        }))
        continue
      }
      if (dataTypeId === DEFECT_OPENNESSES_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleDefectOpennessDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          code: entry.code ?? null,
        }))
        continue
      }
      if (dataTypeId === DEFECT_COATINGS_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleDefectCoatingDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          code: entry.code ?? null,
        }))
        continue
      }
    }
    if (moduleId === LOG_REMARKS_MODULE_SLUG) {
      if (dataTypeId === REMARK_TYPES_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleRemarkTypeDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          tablogsAlias: entry.tablogsAlias ?? null,
        }))
        continue
      }
      if (dataTypeId === REMARKS_QUICK_NOTES_DATA_TYPE_ID) {
        options[dataTypeId] = getModuleRemarksQuickNoteDefaults(moduleId).map((entry) => ({
          id: entry.id,
          name: entry.name,
          remarkTypeId: entry.remarkTypeId,
        }))
        continue
      }
    }
    if (dataTypeId === "remark-types") {
      options[dataTypeId] = DEFAULT_REMARK_TYPES.map((entry) => ({ ...entry }))
      continue
    }
    options[dataTypeId] = []
  }
  return options
}

export function createDefaultModuleSettings(moduleId: string): StoredModuleSettings {
  return {
    ...createDefaultModuleGeneralSettings(moduleId),
    dataTypeOptions: createDefaultDataTypeOptions(moduleId),
  }
}

export function parseModuleGeneralSettings(
  value: unknown,
  moduleId: string
): ModuleGeneralSettings {
  const defaults = createDefaultModuleGeneralSettings(moduleId)
  if (!isRecord(value)) return defaults

  // Preserve spaces while editing — only treat whitespace-only as empty.
  const rawName =
    typeof value.moduleName === "string"
      ? value.moduleName
      : typeof value.displayName === "string"
        ? value.displayName
        : ""

  const moduleName =
    rawName.trim() && rawName.length <= MODULE_DISPLAY_NAME_MAX_LENGTH
      ? rawName
      : defaults.moduleName

  const status =
    value.status === "active" || value.status === "inactive" ? value.status : defaults.status

  return {
    moduleName,
    status,
    showOnWeb: typeof value.showOnWeb === "boolean" ? value.showOnWeb : defaults.showOnWeb,
    showOnMobile:
      typeof value.showOnMobile === "boolean" ? value.showOnMobile : defaults.showOnMobile,
  }
}

function parseDataTypeOptions(
  value: unknown,
  moduleId: string
): Record<string, ModuleNamedOption[]> {
  const defaults = createDefaultDataTypeOptions(moduleId)
  const source = isRecord(value) ? value : {}

  if (Array.isArray(source.remarkTypes) && !source.dataTypeOptions) {
    defaults["remark-types"] = parseNamedOptions(source.remarkTypes, DEFAULT_REMARK_TYPES)
  }

  const nested = isRecord(source.dataTypeOptions) ? source.dataTypeOptions : source
  const result: Record<string, ModuleNamedOption[]> = { ...defaults }

  for (const dataTypeId of MODULE_DATA_TYPE_IDS_BY_MODULE[moduleId] ?? []) {
    if (nested[dataTypeId] === undefined) continue
    result[dataTypeId] = parseNamedOptions(nested[dataTypeId], defaults[dataTypeId] ?? [])
  }

  return result
}

export function parseStoredModuleSettings(
  value: unknown,
  moduleId: string
): StoredModuleSettings {
  return {
    ...parseModuleGeneralSettings(value, moduleId),
    dataTypeOptions: parseDataTypeOptions(value, moduleId),
    ...extractModuleExtras(value),
  }
}

function parseOrder(value: unknown, enabledModules: readonly string[]): string[] {
  const enabled = new Set(enabledModules)
  const order: string[] = []

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry !== "string" || !enabled.has(entry) || order.includes(entry)) {
        continue
      }
      order.push(entry)
    }
  }

  for (const moduleId of enabledModules) {
    if (!order.includes(moduleId)) order.push(moduleId)
  }

  return order
}

function parseInputType(value: unknown): WorkflowFieldInputType | undefined {
  if (typeof value !== "string") return undefined
  return (WORKFLOW_FIELD_INPUT_TYPES as readonly string[]).includes(value)
    ? (value as WorkflowFieldInputType)
    : undefined
}

function parseConditionType(value: unknown): WorkflowStepConditionType | null {
  if (typeof value !== "string") return null
  return (WORKFLOW_STEP_CONDITION_TYPES as readonly string[]).includes(value)
    ? (value as WorkflowStepConditionType)
    : null
}

function parseStepCondition(value: unknown): WorkflowStepCondition | null {
  if (!isRecord(value)) return null
  const type = parseConditionType(value.type)
  const field = typeof value.field === "string" ? value.field.trim() : ""
  if (!type || !field) return null

  const raw = value.value
  let conditionValue: string | boolean | number = ""
  if (typeof raw === "string" || typeof raw === "boolean" || typeof raw === "number") {
    conditionValue = raw
  }

  return {
    type,
    field,
    value: conditionValue,
    searchTerm: typeof value.searchTerm === "string" ? value.searchTerm : undefined,
    isOriginType:
      typeof value.isOriginType === "boolean"
        ? value.isOriginType
        : typeof value.is_origin_type === "boolean"
          ? value.is_origin_type
          : undefined,
    isRockGroup:
      typeof value.isRockGroup === "boolean"
        ? value.isRockGroup
        : typeof value.is_rock_group === "boolean"
          ? value.is_rock_group
          : undefined,
  }
}

function parseStepOption(value: unknown, index: number): WorkflowStepOption | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null
  const rawValue = value.value
  const optionValue =
    typeof rawValue === "string" || typeof rawValue === "number" || typeof rawValue === "boolean"
      ? String(rawValue)
      : name

  const option: WorkflowStepOption = {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `workflow-option-${index + 1}`,
    name,
    value: optionValue,
    visible: typeof value.visible === "boolean" ? value.visible : true,
  }

  if (typeof value.group === "string" && value.group.trim()) option.group = value.group.trim()
  if (typeof value.type === "string" && value.type.trim()) option.group = value.type.trim()
  if (typeof value.abbreviation === "string") option.abbreviation = value.abbreviation
  if (value.isDefault === true || value.is_default === true || value.isSelected === true) {
    option.isDefault = true
  }
  if (typeof value.rockGroup === "string" && value.rockGroup.trim()) {
    option.rockGroup = value.rockGroup.trim()
  }
  if (typeof value.rock_group === "string" && value.rock_group.trim()) {
    option.rockGroup = value.rock_group.trim()
  }

  if (Array.isArray(value.conditions)) {
    const conditions = value.conditions
      .map((entry) => parseStepCondition(entry))
      .filter((entry): entry is WorkflowStepCondition => entry !== null)
    if (conditions.length > 0) option.conditions = conditions
  }

  return option
}

function parseWorkflowStep(value: unknown, index: number): WorkflowStep | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name || name.length > MODULE_OPTION_NAME_MAX_LENGTH) return null
  const type: WorkflowStepType = value.type === "variation" ? "variation" : "element"
  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : `workflow-step-${index + 1}`

  const options: WorkflowStepOption[] = []
  if (Array.isArray(value.options)) {
    for (const [optionIndex, entry] of value.options.entries()) {
      const parsed = parseStepOption(entry, optionIndex)
      if (parsed) options.push(parsed)
    }
  }

  const conditions: WorkflowStepCondition[] = []
  if (Array.isArray(value.conditions)) {
    for (const entry of value.conditions) {
      const parsed = parseStepCondition(entry)
      if (parsed) conditions.push(parsed)
    }
  }

  const step: WorkflowStep = {
    id,
    name,
    type,
    fieldName:
      typeof value.fieldName === "string" && value.fieldName.trim()
        ? value.fieldName.trim()
        : name,
    inputType: parseInputType(value.inputType),
    databaseField:
      typeof value.databaseField === "string" ? value.databaseField : undefined,
    required: typeof value.required === "boolean" ? value.required : undefined,
    unit: typeof value.unit === "string" ? value.unit : undefined,
    optionSet:
      typeof value.optionSet === "string" || value.optionSet === null
        ? value.optionSet
        : undefined,
  }

  if (options.length > 0) step.options = options
  if (conditions.length > 0) step.conditions = conditions
  if (typeof value.multipleOptions === "boolean") step.multipleOptions = value.multipleOptions
  if (typeof value.maxOptionsSelected === "number") {
    step.maxOptionsSelected = value.maxOptionsSelected
  }
  if (typeof value.allowFreeText === "boolean") step.allowFreeText = value.allowFreeText
  if (value.conditionsOperator === "OR" || value.conditionsOperator === "AND") {
    step.conditionsOperator = value.conditionsOperator
  }
  if (typeof value.instructions === "string") step.instructions = value.instructions

  return step
}

export function parseWorkflowSettings(value: unknown): WorkflowSettings {
  if (!isRecord(value)) {
    return {
      enabled: DEFAULT_WORKFLOW_SETTINGS.enabled,
      name: DEFAULT_WORKFLOW_SETTINGS.name,
      ignoreParentLegacySettings: DEFAULT_WORKFLOW_SETTINGS.ignoreParentLegacySettings,
      steps: DEFAULT_WORKFLOW_SETTINGS.steps.map((step) => ({ ...step })),
      applyClassificationRules: DEFAULT_WORKFLOW_SETTINGS.applyClassificationRules,
      classificationCodes: DEFAULT_WORKFLOW_SETTINGS.classificationCodes
        ? [...DEFAULT_WORKFLOW_SETTINGS.classificationCodes]
        : [],
    }
  }

  const nameRaw = typeof value.name === "string" ? value.name.trim() : ""
  const name =
    nameRaw && nameRaw.length <= WORKFLOW_NAME_MAX_LENGTH
      ? nameRaw
      : DEFAULT_WORKFLOW_SETTINGS.name

  const steps: WorkflowStep[] = []
  if (Array.isArray(value.steps)) {
    for (const [index, entry] of value.steps.entries()) {
      if (steps.length >= WORKFLOW_STEPS_MAX_COUNT) break
      const parsed = parseWorkflowStep(entry, index)
      if (!parsed) continue
      if (steps.some((step) => step.id === parsed.id)) continue
      steps.push(parsed)
    }
  }

  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : false,
    name,
    ignoreParentLegacySettings:
      typeof value.ignoreParentLegacySettings === "boolean"
        ? value.ignoreParentLegacySettings
        : DEFAULT_WORKFLOW_SETTINGS.ignoreParentLegacySettings,
    steps: steps.length > 0 ? steps : DEFAULT_WORKFLOW_SETTINGS.steps.map((step) => ({ ...step })),
    applyClassificationRules:
      typeof value.applyClassificationRules === "boolean"
        ? value.applyClassificationRules
        : DEFAULT_WORKFLOW_SETTINGS.applyClassificationRules,
    classificationCodes: Array.isArray(value.classificationCodes)
      ? [...value.classificationCodes]
      : [],
  }
}

export function parseConfigModuleSettings(
  value: unknown,
  enabledModules: readonly string[] = []
): ConfigModuleSettings {
  if (!isRecord(value)) {
    return ensureModuleSettingsForEnabledModules(enabledModules, {
      order: [],
      modules: {},
      workflow: parseWorkflowSettings(undefined),
    })
  }

  const modulesSource = isRecord(value.modules) ? value.modules : value
  const modules: Partial<Record<string, StoredModuleSettings>> = {}

  const candidateIds = new Set<string>([
    ...CONFIG_MODULE_IDS,
    ...enabledModules,
    ...Object.keys(modulesSource),
  ])

  for (const moduleId of candidateIds) {
    if (modulesSource[moduleId] === undefined) continue
    modules[moduleId] = parseStoredModuleSettings(modulesSource[moduleId], moduleId)
  }

  const seedIds = enabledModules.length > 0 ? [...enabledModules] : Object.keys(modules)

  return ensureModuleSettingsForEnabledModules(seedIds, {
    order: parseOrder(value.order, seedIds),
    modules,
    workflow: parseWorkflowSettings(value.workflow),
  })
}

export function serializeConfigModuleSettings(
  value: unknown,
  enabledModules: readonly string[] = []
): ConfigModuleSettings {
  return parseConfigModuleSettings(value, enabledModules)
}

export function ensureModuleSettingsForEnabledModules(
  enabledModules: readonly string[],
  current: ConfigModuleSettings
): ConfigModuleSettings {
  const modules: Partial<Record<string, StoredModuleSettings>> = {
    ...current.modules,
  }

  for (const moduleId of enabledModules) {
    modules[moduleId] = modules[moduleId]
      ? parseStoredModuleSettings(modules[moduleId], moduleId)
      : createDefaultModuleSettings(moduleId)
  }

  for (const moduleId of Object.keys(modules)) {
    if (!enabledModules.includes(moduleId)) {
      delete modules[moduleId]
    }
  }

  return {
    order: parseOrder(current.order, enabledModules),
    modules,
    workflow: parseWorkflowSettings(current.workflow),
  }
}

/** Legacy aliases */
export type LogRemarksModuleSettings = StoredModuleSettings
export const LOG_REMARKS_DISPLAY_NAME_MAX_LENGTH = MODULE_DISPLAY_NAME_MAX_LENGTH
export const LOG_REMARKS_TYPE_NAME_MAX_LENGTH = MODULE_OPTION_NAME_MAX_LENGTH
export const LOG_REMARKS_TYPES_MAX_COUNT = MODULE_OPTIONS_MAX_COUNT
export const DEFAULT_LOG_REMARKS_MODULE_SETTINGS = createDefaultModuleSettings(LOG_REMARKS_MODULE_ID)

export function parseLogRemarksModuleSettings(value: unknown): StoredModuleSettings {
  return parseStoredModuleSettings(value, LOG_REMARKS_MODULE_ID)
}
