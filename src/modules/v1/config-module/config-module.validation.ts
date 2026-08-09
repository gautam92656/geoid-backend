import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../shared/constants"
import {
  CONFIG_MODULE_DESCRIPTION_MAX_LENGTH,
  CONFIG_MODULE_FILTER_CATEGORIES,
  CONFIG_MODULE_SCOPES,
  CONFIG_MODULE_SLUG_MAX_LENGTH,
  CONFIG_MODULE_TAG_LABEL_MAX_LENGTH,
  CONFIG_MODULE_TAG_TONES,
  CONFIG_MODULE_TITLE_MAX_LENGTH,
  REMOVED_CONFIG_MODULE_SLUGS,
} from "../../../shared/constants/configModuleCatalog"
import {
  MODULE_OPTION_NAME_MAX_LENGTH,
  MODULE_OPTIONS_MAX_COUNT,
  WORKFLOW_FIELD_INPUT_TYPES,
  WORKFLOW_NAME_MAX_LENGTH,
  WORKFLOW_STEP_CONDITION_TYPES,
  WORKFLOW_STEP_TYPES,
  WORKFLOW_STEPS_MAX_COUNT,
} from "../../../shared/constants/configModuleSettings"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const moduleSlugParamSchema = Joi.string()
  .trim()
  .max(CONFIG_MODULE_SLUG_MAX_LENGTH)
  .pattern(slugPattern)
  .invalid(...REMOVED_CONFIG_MODULE_SLUGS)

const tagSchema = Joi.object({
  label: Joi.string().trim().max(CONFIG_MODULE_TAG_LABEL_MAX_LENGTH).required(),
  tone: Joi.string()
    .valid(...CONFIG_MODULE_TAG_TONES)
    .required(),
})

const moduleBodySchema = {
  slug: Joi.string()
    .trim()
    .max(CONFIG_MODULE_SLUG_MAX_LENGTH)
    .pattern(slugPattern)
    .invalid(...REMOVED_CONFIG_MODULE_SLUGS)
    .required(),
  title: Joi.string().trim().max(CONFIG_MODULE_TITLE_MAX_LENGTH).required(),
  description: Joi.string()
    .trim()
    .max(CONFIG_MODULE_DESCRIPTION_MAX_LENGTH)
    .required(),
  tags: Joi.array().items(tagSchema).default([]),
  filterCategories: Joi.array().items(Joi.string().trim().max(100)).default([]),
  sourceSlug: Joi.string()
    .trim()
    .max(CONFIG_MODULE_SLUG_MAX_LENGTH)
    .pattern(slugPattern)
    .invalid(...REMOVED_CONFIG_MODULE_SLUGS)
    .allow(null)
    .optional(),
  settings: Joi.object().unknown(true).allow(null).optional(),
  isAvailable: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().min(0).default(0),
}

const workflowStepConditionSchema = Joi.object({
  type: Joi.string()
    .valid(...WORKFLOW_STEP_CONDITION_TYPES)
    .required(),
  field: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  value: Joi.alternatives().try(Joi.string(), Joi.boolean(), Joi.number()).required(),
  searchTerm: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  isOriginType: Joi.boolean().optional(),
  isRockGroup: Joi.boolean().optional(),
})

const workflowStepOptionSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  value: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  visible: Joi.boolean().optional(),
  group: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  rockGroup: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  abbreviation: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  isDefault: Joi.boolean().optional(),
  conditions: Joi.array().items(workflowStepConditionSchema).optional(),
})

const workflowStepSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  type: Joi.string()
    .valid(...WORKFLOW_STEP_TYPES)
    .required(),
  fieldName: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  inputType: Joi.string()
    .valid(...WORKFLOW_FIELD_INPUT_TYPES)
    .optional(),
  databaseField: Joi.string().trim().max(100).optional(),
  required: Joi.boolean().optional(),
  unit: Joi.string().trim().max(20).optional(),
  optionSet: Joi.string().trim().max(100).allow(null).optional(),
  options: Joi.array().items(workflowStepOptionSchema).max(MODULE_OPTIONS_MAX_COUNT).optional(),
  conditions: Joi.array().items(workflowStepConditionSchema).optional(),
  multipleOptions: Joi.boolean().optional(),
  maxOptionsSelected: Joi.number().integer().min(1).max(20).optional(),
  allowFreeText: Joi.boolean().optional(),
  conditionsOperator: Joi.string().valid("AND", "OR").optional(),
  instructions: Joi.string().trim().max(2000).optional(),
})

export const saveUserModuleWorkflowSchema = Joi.object({
  enabled: Joi.boolean().required(),
  name: Joi.string().trim().max(WORKFLOW_NAME_MAX_LENGTH).required(),
  ignoreParentLegacySettings: Joi.boolean().optional(),
  steps: Joi.array().items(workflowStepSchema).max(WORKFLOW_STEPS_MAX_COUNT).required(),
  applyClassificationRules: Joi.boolean().optional(),
  classificationCodes: Joi.array().items(Joi.object().unknown(true)).optional(),
})

export const originOptionSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  nameInDescription: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  codeInDescription: Joi.string().trim().max(100).allow(null, "").optional(),
  classificationCodeOverride: Joi.boolean().optional(),
  type: Joi.string().trim().max(50).optional(),
  color: Joi.string().trim().max(100).allow(null, "").optional(),
  applyColorToPdf: Joi.boolean().optional(),
  overrideGraphic: Joi.boolean().optional(),
  splitGraphic: Joi.boolean().optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
}).unknown(true)

export const saveUserOriginOptionsSchema = Joi.object({
  options: Joi.array().items(originOptionSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
})

/** Accept either `{ options: [...] }` or a raw array body. */
export const saveUserOriginOptionsBodySchema = Joi.alternatives().try(
  saveUserOriginOptionsSchema,
  Joi.array().items(originOptionSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const originOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const insituTestTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  active: Joi.boolean().optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  enableSegregatedGraphic: Joi.boolean().optional(),
  topGraphic: Joi.string().trim().max(255).allow(null, "").optional(),
  bottomGraphic: Joi.string().trim().max(255).allow(null, "").optional(),
  depthFrequencyEnabled: Joi.boolean().optional(),
  depthFrequency: Joi.string().trim().max(100).allow(null, "").optional(),
  enableSampleLogging: Joi.boolean().optional(),
  enableSubsurfaceLogging: Joi.boolean().optional(),
  defaultSampleTypeId: Joi.string().trim().max(100).allow(null, "").optional(),
  enableAutoSampleDescription: Joi.boolean().optional(),
  settings: Joi.object({
    otherSettings: Joi.array().items(Joi.object().unknown(true)).optional(),
    unitSettings: Joi.array().items(Joi.object().unknown(true)).optional(),
    order: Joi.number().integer().allow(null).optional(),
  })
    .unknown(true)
    .optional(),
}).unknown(true)

export const saveInsituTestTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(insituTestTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(insituTestTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const insituUnitSettingSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
}).unknown(true)

export const saveInsituUnitSettingsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array()
      .items(insituUnitSettingSchema)
      .max(MODULE_OPTIONS_MAX_COUNT)
      .required(),
  }),
  Joi.array().items(insituUnitSettingSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const insituOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const coreDefectTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  code: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  defaultSampleTypeId: Joi.string().trim().max(100).allow(null, "").optional(),
}).unknown(true)

export const saveCoreDefectTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(coreDefectTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(coreDefectTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const apertureColorSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  color: Joi.string().trim().max(50).allow(null, "").optional(),
  textColor: Joi.string().trim().max(50).allow(null, "").optional(),
}).unknown(true)

export const saveApertureColorsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(apertureColorSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(apertureColorSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const apertureMineralSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  code: Joi.string().trim().max(100).allow(null, "").optional(),
}).unknown(true)

export const saveApertureMineralsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(apertureMineralSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(apertureMineralSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const infillMaterialSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  code: Joi.string().trim().max(100).allow(null, "").optional(),
}).unknown(true)

export const saveInfillMaterialsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(infillMaterialSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(infillMaterialSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const coreLoggingOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const remarkTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
}).unknown(true)

export const saveRemarkTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(remarkTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(remarkTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const remarksQuickNoteSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  remarkTypeId: Joi.string().trim().max(100).required(),
}).unknown(true)

export const saveRemarksQuickNotesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array()
      .items(remarksQuickNoteSchema)
      .max(MODULE_OPTIONS_MAX_COUNT)
      .required(),
  }),
  Joi.array().items(remarksQuickNoteSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const logRemarksOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const drillingTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  logKind: Joi.string().valid("bore", "core").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  enableRecoveryField: Joi.boolean().optional(),
  enableWindowedWindowless: Joi.boolean().optional(),
  waterAdded: Joi.boolean().optional(),
}).unknown(true)

export const saveDrillingTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(drillingTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(drillingTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const drillingResistanceSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
}).unknown(true)

export const saveDrillingResistancesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array()
      .items(drillingResistanceSchema)
      .max(MODULE_OPTIONS_MAX_COUNT)
      .required(),
  }),
  Joi.array().items(drillingResistanceSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const drillingObservationSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  depthRequired: Joi.boolean().optional(),
  observationDateTimeRequired: Joi.boolean().optional(),
  isDepthOfCasing: Joi.boolean().optional(),
  isDepthToWater: Joi.boolean().optional(),
}).unknown(true)

export const saveDrillingObservationsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array()
      .items(drillingObservationSchema)
      .max(MODULE_OPTIONS_MAX_COUNT)
      .required(),
  }),
  Joi.array().items(drillingObservationSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const drillingCasingSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  startGraphic: Joi.string().trim().max(255).allow(null, "").optional(),
  endGraphic: Joi.string().trim().max(255).allow(null, "").optional(),
}).unknown(true)

export const saveDrillingCasingsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(drillingCasingSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(drillingCasingSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const drillingObservationsOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const waterObservationTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  depthRequired: Joi.boolean().optional(),
}).unknown(true)

export const saveWaterObservationTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array()
      .items(waterObservationTypeSchema)
      .max(MODULE_OPTIONS_MAX_COUNT)
      .required(),
  }),
  Joi.array().items(waterObservationTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const waterObservationsOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const sampleTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  sampleAbbreviation: Joi.string().trim().max(100).allow(null, "").optional(),
  noteRecovery: Joi.boolean().optional(),
  displayQcId: Joi.boolean().optional(),
  enableSegregatedGraphic: Joi.boolean().optional(),
  topGraphic: Joi.string().trim().max(255).allow(null, "").optional(),
  bottomGraphic: Joi.string().trim().max(255).allow(null, "").optional(),
  enableSubsurfaceLogging: Joi.boolean().optional(),
  enableAssignLabTest: Joi.boolean().optional(),
  enableInsituTestLogging: Joi.boolean().optional(),
  defaultInsituTestTypeId: Joi.string().trim().max(100).allow(null, "").optional(),
}).unknown(true)

export const saveSampleTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(sampleTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(sampleTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const samplesOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const labTestTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  externalAlias: Joi.string().trim().max(200).allow(null, "").optional(),
  aliasTable: Joi.string().trim().max(200).allow(null, "").optional(),
  addAsSelectedDataPlot: Joi.boolean().optional(),
  active: Joi.boolean().optional(),
  labTestResultFields: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().trim().max(100).required(),
        name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).allow("").required(),
        externalAlias: Joi.string().trim().max(200).allow(null, "").optional(),
        tablogsAlias: Joi.string().trim().max(200).allow(null, "").optional(),
      }).unknown(true)
    )
    .max(MODULE_OPTIONS_MAX_COUNT)
    .optional(),
}).unknown(true)

export const saveLabTestTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(labTestTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(labTestTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const labTestPresetSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  labTestTypeIds: Joi.array().items(Joi.string().trim().max(100)).max(MODULE_OPTIONS_MAX_COUNT).optional(),
}).unknown(true)

export const saveLabTestPresetsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(labTestPresetSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(labTestPresetSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const labTestsOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const wellLogsOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const wellTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  allowNegativeDepth: Joi.boolean().optional(),
}).unknown(true)

export const saveWellTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(wellTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(wellTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const wellCasingTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  type: Joi.string().valid("surface", "regular").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  allowNegativeDepth: Joi.boolean().optional(),
}).unknown(true)

export const saveWellCasingTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(wellCasingTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(wellCasingTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const wellCasingTopSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  allowNegativeDepth: Joi.boolean().optional(),
}).unknown(true)

export const saveWellCasingTopsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(wellCasingTopSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(wellCasingTopSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const wellCoverTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  allowNegativeDepth: Joi.boolean().optional(),
  graphicAlignment: Joi.string().valid("top", "bottom").optional(),
}).unknown(true)

export const saveWellCoverTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(wellCoverTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(wellCoverTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const wellProbeTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  recordDepthTo: Joi.boolean().optional(),
}).unknown(true)

export const saveWellProbeTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(wellProbeTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(wellProbeTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const wellBackfillTypeSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  tablogsAlias: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
}).unknown(true)

export const saveWellBackfillTypesBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(wellBackfillTypeSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(wellBackfillTypeSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const wellDefaultWellIdSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
}).unknown(true)

export const saveWellDefaultWellIdsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(wellDefaultWellIdSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(wellDefaultWellIdSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const dataTypeOptionSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  code: Joi.string().trim().max(100).allow(null, "").optional(),
  abbreviation: Joi.string().trim().max(100).allow(null, "").optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
  rockGroup: Joi.string().trim().max(100).allow(null, "").optional(),
  color: Joi.string().trim().max(100).allow(null, "").optional(),
  overlayColor: Joi.string().trim().max(100).allow(null, "").optional(),
  textColor: Joi.string().trim().max(100).allow(null, "").optional(),
  showAutoScale: Joi.boolean().optional(),
}).unknown(true)

export const saveUserDataTypeOptionsBodySchema = Joi.alternatives().try(
  Joi.object({
    options: Joi.array().items(dataTypeOptionSchema).max(MODULE_OPTIONS_MAX_COUNT).required(),
  }),
  Joi.array().items(dataTypeOptionSchema).max(MODULE_OPTIONS_MAX_COUNT)
)

export const moduleDataTypeParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  dataTypeId: Joi.string().trim().max(100).required(),
})

export const moduleDataTypeOptionKeyParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
  dataTypeId: Joi.string().trim().max(100).required(),
  optionKey: Joi.string().trim().max(100).required(),
})

export const moduleSlugParamValidationSchema = Joi.object({
  moduleSlug: moduleSlugParamSchema.required(),
})

/** Required query param for per-config user customization endpoints. */
export const logConfigurationIdRequiredQuerySchema = Joi.object({
  logConfigurationId: Joi.number().integer().min(1).required(),
})

const logConfigurationIdBodyField = Joi.number().integer().min(1).required()

export const createConfigModuleSchema = Joi.object({
  ...moduleBodySchema,
  logConfigurationId: logConfigurationIdBodyField,
})

export const adoptConfigModuleSchema = Joi.object({
  logConfigurationId: logConfigurationIdBodyField,
  templateSlug: Joi.string()
    .trim()
    .max(CONFIG_MODULE_SLUG_MAX_LENGTH)
    .pattern(slugPattern)
    .invalid(...REMOVED_CONFIG_MODULE_SLUGS)
    .required(),
})

/** Same body shape as adopt — remove a previously adopted module from this config. */
export const unadoptConfigModuleSchema = adoptConfigModuleSchema

export const syncUserModuleSettingsSchema = Joi.object({
  logConfigurationId: logConfigurationIdBodyField,
  modules: Joi.object()
    .pattern(
      Joi.string()
        .trim()
        .pattern(slugPattern)
        .max(CONFIG_MODULE_SLUG_MAX_LENGTH)
        .invalid(...REMOVED_CONFIG_MODULE_SLUGS),
      Joi.object().unknown(true).required()
    )
    .min(1)
    .required(),
})

export const updateConfigModuleSchema = Joi.object({
  slug: Joi.string()
    .trim()
    .max(CONFIG_MODULE_SLUG_MAX_LENGTH)
    .pattern(slugPattern)
    .invalid(...REMOVED_CONFIG_MODULE_SLUGS)
    .optional(),
  title: Joi.string().trim().max(CONFIG_MODULE_TITLE_MAX_LENGTH).optional(),
  description: Joi.string()
    .trim()
    .max(CONFIG_MODULE_DESCRIPTION_MAX_LENGTH)
    .optional(),
  tags: Joi.array().items(tagSchema).optional(),
  filterCategories: Joi.array().items(Joi.string().trim().max(100)).optional(),
  settings: Joi.object().unknown(true).allow(null).optional(),
  isAvailable: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listConfigModulesQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  availableOnly: Joi.string().valid("true", "false").default("true"),
  search: Joi.string().trim().optional(),
  scope: Joi.string()
    .valid(...CONFIG_MODULE_SCOPES)
    .optional(),
  category: Joi.string()
    .trim()
    .valid(...CONFIG_MODULE_FILTER_CATEGORIES)
    .optional(),
  sortBy: Joi.string()
    .valid("id", "slug", "title", "sortOrder", "createdAt", "scope")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  logConfigurationId: Joi.number().integer().min(1).optional(),
})
