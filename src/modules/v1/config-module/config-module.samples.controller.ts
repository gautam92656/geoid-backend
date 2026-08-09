import type { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import type { AuthedRequest } from "../../../types/auth"
import {
  logConfigurationIdRequiredQuerySchema,
  moduleSlugParamValidationSchema,
  samplesOptionKeyParamValidationSchema,
  sampleTypeSchema,
  saveSampleTypesBodySchema,
} from "./config-module.validation"
import * as sampleTypeService from "./config-module.sampleType.service"

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

export async function getSampleTypeTemplates(
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

  const data = await sampleTypeService.getSampleTypeTemplates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserSampleTypes(
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

  const data = await sampleTypeService.getUserSampleTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserSampleTypes(
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

  const { error, value } = saveSampleTypesBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await sampleTypeService.saveUserSampleTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_SAMPLE_TYPES_SAVED, HTTP_STATUS.OK)
}

export async function createUserSampleType(
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

  const { error, value } = sampleTypeSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await sampleTypeService.createUserSampleType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_SAMPLE_TYPE_ADDED, HTTP_STATUS.CREATED)
}

export async function updateUserSampleType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = samplesOptionKeyParamValidationSchema.validate(
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

  const { error, value } = sampleTypeSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await sampleTypeService.updateUserSampleType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_SAMPLE_TYPE_UPDATED, HTTP_STATUS.OK)
}

export async function deleteUserSampleType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = samplesOptionKeyParamValidationSchema.validate(req.params, {
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

  await sampleTypeService.deleteUserSampleType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_SAMPLE_TYPE_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserSampleTypes(
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

  const data = await sampleTypeService.resetUserSampleTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.CONFIG_MODULE_SAMPLE_TYPES_RESET, HTTP_STATUS.OK)
}
