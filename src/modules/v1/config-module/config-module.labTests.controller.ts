import type { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import type { AuthedRequest } from "../../../types/auth"
import {
  logConfigurationIdRequiredQuerySchema,
  moduleSlugParamValidationSchema,
  labTestsOptionKeyParamValidationSchema,
  labTestTypeSchema,
  saveLabTestTypesBodySchema,
  labTestPresetSchema,
  saveLabTestPresetsBodySchema,
} from "./config-module.validation"
import * as labTestTypeService from "./config-module.labTestType.service"
import * as labTestPresetService from "./config-module.labTestPreset.service"

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

export async function getLabTestTypeTemplates(
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

  const data = await labTestTypeService.getLabTestTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserLabTestTypes(
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

  const data = await labTestTypeService.getUserLabTestTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserLabTestTypes(
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

  const { error, value } = saveLabTestTypesBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await labTestTypeService.saveUserLabTestTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_TYPES_SAVED, HTTP_STATUS.OK)
}

export async function createUserLabTestType(
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

  const { error, value } = labTestTypeSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await labTestTypeService.createUserLabTestType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_TYPE_ADDED, HTTP_STATUS.CREATED)
}

export async function updateUserLabTestType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = labTestsOptionKeyParamValidationSchema.validate(
    req.params,
    {
      abortEarly: false,
    }
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

  const { error, value } = labTestTypeSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await labTestTypeService.updateUserLabTestType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_TYPE_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserLabTestType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = labTestsOptionKeyParamValidationSchema.validate(req.params, {
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

  await labTestTypeService.deleteUserLabTestType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_LAB_TEST_TYPE_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserLabTestTypes(
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

  const data = await labTestTypeService.resetUserLabTestTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_TYPES_RESET, HTTP_STATUS.OK)
}

export async function getLabTestPresetTemplates(
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

  const data = await labTestPresetService.getLabTestPresetTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserLabTestPresets(
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

  const data = await labTestPresetService.getUserLabTestPresets(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserLabTestPresets(
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

  const { error, value } = saveLabTestPresetsBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await labTestPresetService.saveUserLabTestPresets(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_PRESETS_SAVED, HTTP_STATUS.OK)
}

export async function createUserLabTestPreset(
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

  const { error, value } = labTestPresetSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await labTestPresetService.createUserLabTestPreset(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_PRESET_ADDED, HTTP_STATUS.CREATED)
}

export async function updateUserLabTestPreset(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = labTestsOptionKeyParamValidationSchema.validate(
    req.params,
    {
      abortEarly: false,
    }
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

  const { error, value } = labTestPresetSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await labTestPresetService.updateUserLabTestPreset(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_PRESET_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserLabTestPreset(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = labTestsOptionKeyParamValidationSchema.validate(req.params, {
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

  await labTestPresetService.deleteUserLabTestPreset(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_LAB_TEST_PRESET_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserLabTestPresets(
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

  const data = await labTestPresetService.resetUserLabTestPresets(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_LAB_TEST_PRESETS_RESET, HTTP_STATUS.OK)
}
