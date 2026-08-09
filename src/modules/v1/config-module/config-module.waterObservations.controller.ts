import type { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import type { AuthedRequest } from "../../../types/auth"
import {
  logConfigurationIdRequiredQuerySchema,
  moduleSlugParamValidationSchema,
  waterObservationsOptionKeyParamValidationSchema,
  waterObservationTypeSchema,
  saveWaterObservationTypesBodySchema,
} from "./config-module.validation"
import * as waterObservationTypeService from "./config-module.waterObservationType.service"

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

export async function getWaterObservationTypeTemplates(
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

  const data = await waterObservationTypeService.getWaterObservationTypeTemplates(
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUserWaterObservationTypes(
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

  const data = await waterObservationTypeService.getUserWaterObservationTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUserWaterObservationTypes(
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

  const { error, value } = saveWaterObservationTypesBodySchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await waterObservationTypeService.saveUserWaterObservationTypes(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_WATER_OBSERVATION_TYPES_SAVED,
    HTTP_STATUS.OK
  )
}

export async function createUserWaterObservationType(
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

  const { error, value } = waterObservationTypeSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await waterObservationTypeService.createUserWaterObservationType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_WATER_OBSERVATION_TYPE_ADDED,
    HTTP_STATUS.CREATED
  )
}

export async function updateUserWaterObservationType(
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
    waterObservationsOptionKeyParamValidationSchema.validate(req.params, {
      abortEarly: false,
    })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = waterObservationTypeSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await waterObservationTypeService.updateUserWaterObservationType(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_WATER_OBSERVATION_TYPE_UPDATED,
    HTTP_STATUS.OK
  )
}

export async function deleteUserWaterObservationType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = waterObservationsOptionKeyParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  await waterObservationTypeService.deleteUserWaterObservationType(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(
    res,
    { deleted: true },
    API_MESSAGES.CONFIG_MODULE_WATER_OBSERVATION_TYPE_DELETED,
    HTTP_STATUS.OK
  )
}

export async function resetUserWaterObservationTypes(
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

  const data = await waterObservationTypeService.resetUserWaterObservationTypes(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(
    res,
    data,
    API_MESSAGES.CONFIG_MODULE_WATER_OBSERVATION_TYPES_RESET,
    HTTP_STATUS.OK
  )
}
