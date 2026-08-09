import type { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import type { AuthedRequest } from "../../../types/auth"
import * as configModuleService from "./config-module.service"
import type { ModuleScope } from "./config-module.repository"
import {
  adoptConfigModuleSchema,
  unadoptConfigModuleSchema,
  createConfigModuleSchema,
  listConfigModulesQuerySchema,
  logConfigurationIdRequiredQuerySchema,
  moduleSlugParamValidationSchema,
  moduleDataTypeParamValidationSchema,
  moduleDataTypeOptionKeyParamValidationSchema,
  originOptionKeyParamValidationSchema,
  originOptionSchema,
  dataTypeOptionSchema,
  insituTestTypeSchema,
  saveInsituTestTypesBodySchema,
  insituUnitSettingSchema,
  saveInsituUnitSettingsBodySchema,
  insituOptionKeyParamValidationSchema,
  saveUserModuleWorkflowSchema,
  saveUserOriginOptionsBodySchema,
  saveUserDataTypeOptionsBodySchema,
  syncUserModuleSettingsSchema,
  updateConfigModuleSchema,
} from "./config-module.validation"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import * as workflowService from "./config-module.workflow.service"
import * as originService from "./config-module.origin.service"
import * as dataTypeOptionService from "./config-module.dataTypeOption.service"
import * as insituTestTypeService from "./config-module.insituTestType.service"
import * as insituUnitSettingService from "./config-module.insituUnitSetting.service"

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

function parseId(req: Request): number | null {
  const id = parseInt(String(req.params.id), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

/** Validate and return required logConfigurationId from query string. */
function parseRequiredLogConfigurationId(
  req: Request
): { ok: true; logConfigurationId: number } | { ok: false; message: string } {
  const { error, value } = logConfigurationIdRequiredQuerySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
    allowUnknown: true,
  })
  if (error) {
    return { ok: false, message: error.details.map((d) => d.message).join("; ") }
  }
  return { ok: true, logConfigurationId: value.logConfigurationId }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = listConfigModulesQuerySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  let includeDeleted: boolean | undefined
  if (value.includeDeleted === "true") includeDeleted = true
  else if (value.includeDeleted === "false") includeDeleted = false

  let availableOnly: boolean | undefined
  if (value.availableOnly === "true") availableOnly = true
  else if (value.availableOnly === "false") availableOnly = false

  let listUserId = userId
  if (value.logConfigurationId != null) {
    const access = await assertAccessibleLogConfiguration(userId, value.logConfigurationId)
    listUserId = access.ownerUserId
  }

  const data = await configModuleService.list({
    page: value.page,
    limit: value.limit,
    userId: listUserId,
    logConfigurationId: value.logConfigurationId,
    includeDeleted,
    availableOnly,
    search: value.search,
    scope: value.scope as ModuleScope | undefined,
    category: value.category,
    sortBy: value.sortBy,
    sortOrder: value.sortOrder,
  })
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function adopt(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = adoptConfigModuleSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await configModuleService.adoptTemplate(
    userId,
    value.logConfigurationId,
    value.templateSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_ADOPTED, HTTP_STATUS.OK)
}

export async function unadopt(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = unadoptConfigModuleSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await configModuleService.unadoptTemplate(
    userId,
    value.logConfigurationId,
    value.templateSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_DELETED, HTTP_STATUS.OK)
}

export async function syncSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = syncUserModuleSettingsSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await configModuleService.syncManyUserModuleSettings(
    userId,
    value.logConfigurationId,
    value.modules
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_SETTINGS_SAVED, HTTP_STATUS.OK)
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await configModuleService.getOne(id, userId)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = createConfigModuleSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await configModuleService.createUserModule(userId, value)
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_ADDED, HTTP_STATUS.CREATED)
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const { error, value } = updateConfigModuleSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await configModuleService.updateUserModule(id, userId, value)
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_UPDATED, HTTP_STATUS.OK)
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await configModuleService.removeUserModule(id, userId)
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_DELETED, HTTP_STATUS.OK)
}

export async function getWorkflowTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await workflowService.getWorkflowTemplate(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWorkflow(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await workflowService.getUserWorkflow(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWorkflow(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = saveUserModuleWorkflowSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await workflowService.saveUserWorkflow(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_WORKFLOW_SAVED,
    HTTP_STATUS.OK
  )
}

export async function resetUserWorkflow(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await workflowService.resetUserWorkflow(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_WORKFLOW_RESET,
    HTTP_STATUS.OK
  )
}

export async function getOriginOptionTemplates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await originService.getOriginOptionTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserOriginOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await originService.getUserOriginOptions(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserOriginOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = saveUserOriginOptionsBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await originService.saveUserOriginOptions(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_ORIGINS_SAVED,
    HTTP_STATUS.OK
  )
}

export async function createUserOriginOption(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = originOptionSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await originService.createUserOriginOption(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_ORIGIN_ADDED,
    HTTP_STATUS.CREATED
  )
}

export async function updateUserOriginOption(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = originOptionKeyParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = originOptionSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await originService.updateUserOriginOption(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_ORIGIN_UPDATED,
    HTTP_STATUS.OK
  )
}

export async function deleteUserOriginOption(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = originOptionKeyParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  await originService.deleteUserOriginOption(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_ORIGIN_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserOriginOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await originService.resetUserOriginOptions(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_ORIGINS_RESET,
    HTTP_STATUS.OK
  )
}

export async function getInsituTestTypeTemplates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await insituTestTypeService.getInsituTestTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserInsituTestTypes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await insituTestTypeService.getUserInsituTestTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserInsituTestTypes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = saveInsituTestTypesBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await insituTestTypeService.saveUserInsituTestTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_TEST_TYPES_SAVED,
    HTTP_STATUS.OK
  )
}

export async function createUserInsituTestType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = insituTestTypeSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await insituTestTypeService.createUserInsituTestType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_TEST_TYPE_ADDED,
    HTTP_STATUS.CREATED
  )
}

export async function updateUserInsituTestType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = insituOptionKeyParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = insituTestTypeSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await insituTestTypeService.updateUserInsituTestType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_TEST_TYPE_UPDATED,
    HTTP_STATUS.OK
  )
}

export async function deleteUserInsituTestType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = insituOptionKeyParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  await insituTestTypeService.deleteUserInsituTestType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_INSITU_TEST_TYPE_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserInsituTestTypes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await insituTestTypeService.resetUserInsituTestTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_TEST_TYPES_RESET,
    HTTP_STATUS.OK
  )
}

export async function getInsituUnitSettingTemplates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await insituUnitSettingService.getInsituUnitSettingTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserInsituUnitSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await insituUnitSettingService.getUserInsituUnitSettings(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserInsituUnitSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = saveInsituUnitSettingsBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await insituUnitSettingService.saveUserInsituUnitSettings(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_UNIT_SETTINGS_SAVED,
    HTTP_STATUS.OK
  )
}

export async function createUserInsituUnitSetting(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = insituUnitSettingSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await insituUnitSettingService.createUserInsituUnitSetting(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_UNIT_SETTING_ADDED,
    HTTP_STATUS.CREATED
  )
}

export async function updateUserInsituUnitSetting(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = insituOptionKeyParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = insituUnitSettingSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await insituUnitSettingService.updateUserInsituUnitSetting(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_UNIT_SETTING_UPDATED,
    HTTP_STATUS.OK
  )
}

export async function deleteUserInsituUnitSetting(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = insituOptionKeyParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  await insituUnitSettingService.deleteUserInsituUnitSetting(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_INSITU_UNIT_SETTING_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserInsituUnitSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await insituUnitSettingService.resetUserInsituUnitSettings(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_INSITU_UNIT_SETTINGS_RESET,
    HTTP_STATUS.OK
  )
}

export async function getDataTypeOptionTemplates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleDataTypeParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await dataTypeOptionService.getDataTypeOptionTemplates(
    value.moduleSlug,
    value.dataTypeId
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserDataTypeOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleDataTypeParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await dataTypeOptionService.getUserDataTypeOptions(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.dataTypeId
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserDataTypeOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleDataTypeParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = saveUserDataTypeOptionsBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await dataTypeOptionService.saveUserDataTypeOptions(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.dataTypeId,
    options
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_DATA_TYPE_OPTIONS_SAVED,
    HTTP_STATUS.OK
  )
}

export async function createUserDataTypeOption(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleDataTypeParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = dataTypeOptionSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await dataTypeOptionService.createUserDataTypeOption(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.dataTypeId,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_DATA_TYPE_OPTION_ADDED,
    HTTP_STATUS.CREATED
  )
}

export async function updateUserDataTypeOption(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } =
    moduleDataTypeOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = dataTypeOptionSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await dataTypeOptionService.updateUserDataTypeOption(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.dataTypeId,
    params.optionKey,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_DATA_TYPE_OPTION_UPDATED,
    HTTP_STATUS.OK
  )
}

export async function deleteUserDataTypeOption(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleDataTypeOptionKeyParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  await dataTypeOptionService.deleteUserDataTypeOption(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.dataTypeId,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_DATA_TYPE_OPTION_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserDataTypeOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleDataTypeParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await dataTypeOptionService.resetUserDataTypeOptions(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.dataTypeId
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_DATA_TYPE_OPTIONS_RESET,
    HTTP_STATUS.OK
  )
}
