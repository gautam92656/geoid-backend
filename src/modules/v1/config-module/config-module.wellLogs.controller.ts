import type { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import type { AuthedRequest } from "../../../types/auth"
import {
  logConfigurationIdRequiredQuerySchema,
  moduleSlugParamValidationSchema,
  wellLogsOptionKeyParamValidationSchema,
  wellTypeSchema,
  saveWellTypesBodySchema,
  wellCasingTypeSchema,
  saveWellCasingTypesBodySchema,
  wellCasingTopSchema,
  saveWellCasingTopsBodySchema,
  wellCoverTypeSchema,
  saveWellCoverTypesBodySchema,
  wellProbeTypeSchema,
  saveWellProbeTypesBodySchema,
  wellBackfillTypeSchema,
  saveWellBackfillTypesBodySchema,
  wellDefaultWellIdSchema,
  saveWellDefaultWellIdsBodySchema,
} from "./config-module.validation"
import * as wellTypeService from "./config-module.wellType.service"
import * as wellCasingTypeService from "./config-module.wellCasingType.service"
import * as wellCasingTopService from "./config-module.wellCasingTop.service"
import * as wellCoverTypeService from "./config-module.wellCoverType.service"
import * as wellProbeTypeService from "./config-module.wellProbeType.service"
import * as wellBackfillTypeService from "./config-module.wellBackfillType.service"
import * as wellDefaultWellIdService from "./config-module.wellDefaultWellId.service"

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

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

export async function getWellTypeTemplates(
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

  const data = await wellTypeService.getWellTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWellTypes(
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

  const data = await wellTypeService.getUserWellTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWellTypes(
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

  const { error, value } = saveWellTypesBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await wellTypeService.saveUserWellTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_SAVED, HTTP_STATUS.OK)
}

export async function createUserWellType(
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

  const { error, value } = wellTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellTypeService.createUserWellType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_ADDED, HTTP_STATUS.CREATED)
}

export async function resetUserWellTypes(
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

  const data = await wellTypeService.resetUserWellTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_RESET, HTTP_STATUS.OK)
}

export async function updateUserWellType(
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
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = wellTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellTypeService.updateUserWellType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserWellType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
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

  await wellTypeService.deleteUserWellType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_DELETED, HTTP_STATUS.OK)
}

export async function getWellCasingTypeTemplates(
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

  const data = await wellCasingTypeService.getWellCasingTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWellCasingTypes(
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

  const data = await wellCasingTypeService.getUserWellCasingTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWellCasingTypes(
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

  const { error, value } = saveWellCasingTypesBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await wellCasingTypeService.saveUserWellCasingTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_SAVED, HTTP_STATUS.OK)
}

export async function createUserWellCasingType(
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

  const { error, value } = wellCasingTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellCasingTypeService.createUserWellCasingType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_ADDED, HTTP_STATUS.CREATED)
}

export async function resetUserWellCasingTypes(
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

  const data = await wellCasingTypeService.resetUserWellCasingTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_RESET, HTTP_STATUS.OK)
}

export async function updateUserWellCasingType(
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
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = wellCasingTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellCasingTypeService.updateUserWellCasingType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserWellCasingType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
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

  await wellCasingTypeService.deleteUserWellCasingType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_DELETED, HTTP_STATUS.OK)
}

export async function getWellCasingTopTemplates(
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

  const data = await wellCasingTopService.getWellCasingTopTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWellCasingTops(
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

  const data = await wellCasingTopService.getUserWellCasingTops(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWellCasingTops(
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

  const { error, value } = saveWellCasingTopsBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await wellCasingTopService.saveUserWellCasingTops(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_SAVED, HTTP_STATUS.OK)
}

export async function createUserWellCasingTop(
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

  const { error, value } = wellCasingTopSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellCasingTopService.createUserWellCasingTop(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_ADDED, HTTP_STATUS.CREATED)
}

export async function resetUserWellCasingTops(
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

  const data = await wellCasingTopService.resetUserWellCasingTops(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_RESET, HTTP_STATUS.OK)
}

export async function updateUserWellCasingTop(
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
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = wellCasingTopSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellCasingTopService.updateUserWellCasingTop(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserWellCasingTop(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
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

  await wellCasingTopService.deleteUserWellCasingTop(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_DELETED, HTTP_STATUS.OK)
}

export async function getWellCoverTypeTemplates(
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

  const data = await wellCoverTypeService.getWellCoverTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWellCoverTypes(
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

  const data = await wellCoverTypeService.getUserWellCoverTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWellCoverTypes(
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

  const { error, value } = saveWellCoverTypesBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await wellCoverTypeService.saveUserWellCoverTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_SAVED, HTTP_STATUS.OK)
}

export async function createUserWellCoverType(
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

  const { error, value } = wellCoverTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellCoverTypeService.createUserWellCoverType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_ADDED, HTTP_STATUS.CREATED)
}

export async function resetUserWellCoverTypes(
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

  const data = await wellCoverTypeService.resetUserWellCoverTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_RESET, HTTP_STATUS.OK)
}

export async function updateUserWellCoverType(
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
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = wellCoverTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellCoverTypeService.updateUserWellCoverType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserWellCoverType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
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

  await wellCoverTypeService.deleteUserWellCoverType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_DELETED, HTTP_STATUS.OK)
}

export async function getWellProbeTypeTemplates(
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

  const data = await wellProbeTypeService.getWellProbeTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWellProbeTypes(
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

  const data = await wellProbeTypeService.getUserWellProbeTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWellProbeTypes(
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

  const { error, value } = saveWellProbeTypesBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await wellProbeTypeService.saveUserWellProbeTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_SAVED, HTTP_STATUS.OK)
}

export async function createUserWellProbeType(
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

  const { error, value } = wellProbeTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellProbeTypeService.createUserWellProbeType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_ADDED, HTTP_STATUS.CREATED)
}

export async function resetUserWellProbeTypes(
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

  const data = await wellProbeTypeService.resetUserWellProbeTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_RESET, HTTP_STATUS.OK)
}

export async function updateUserWellProbeType(
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
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = wellProbeTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellProbeTypeService.updateUserWellProbeType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserWellProbeType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
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

  await wellProbeTypeService.deleteUserWellProbeType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_DELETED, HTTP_STATUS.OK)
}

export async function getWellBackfillTypeTemplates(
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

  const data = await wellBackfillTypeService.getWellBackfillTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWellBackfillTypes(
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

  const data = await wellBackfillTypeService.getUserWellBackfillTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWellBackfillTypes(
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

  const { error, value } = saveWellBackfillTypesBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await wellBackfillTypeService.saveUserWellBackfillTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_SAVED, HTTP_STATUS.OK)
}

export async function createUserWellBackfillType(
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

  const { error, value } = wellBackfillTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellBackfillTypeService.createUserWellBackfillType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_ADDED, HTTP_STATUS.CREATED)
}

export async function resetUserWellBackfillTypes(
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

  const data = await wellBackfillTypeService.resetUserWellBackfillTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_RESET, HTTP_STATUS.OK)
}

export async function updateUserWellBackfillType(
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
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = wellBackfillTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellBackfillTypeService.updateUserWellBackfillType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserWellBackfillType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
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

  await wellBackfillTypeService.deleteUserWellBackfillType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_DELETED, HTTP_STATUS.OK)
}

export async function getWellDefaultWellIdTemplates(
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

  const data = await wellDefaultWellIdService.getWellDefaultWellIdTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWellDefaultWellIds(
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

  const data = await wellDefaultWellIdService.getUserWellDefaultWellIds(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWellDefaultWellIds(
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

  const { error, value } = saveWellDefaultWellIdsBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await wellDefaultWellIdService.saveUserWellDefaultWellIds(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_SAVED, HTTP_STATUS.OK)
}

export async function createUserWellDefaultWellId(
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

  const { error, value } = wellDefaultWellIdSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellDefaultWellIdService.createUserWellDefaultWellId(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_ADDED, HTTP_STATUS.CREATED)
}

export async function resetUserWellDefaultWellIds(
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

  const data = await wellDefaultWellIdService.resetUserWellDefaultWellIds(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTIONS_RESET, HTTP_STATUS.OK)
}

export async function updateUserWellDefaultWellId(
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
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = wellDefaultWellIdSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await wellDefaultWellIdService.updateUserWellDefaultWellId(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserWellDefaultWellId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
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

  await wellDefaultWellIdService.deleteUserWellDefaultWellId(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.CONFIG_MODULE_WELL_LOGS_OPTION_DELETED, HTTP_STATUS.OK)
}
