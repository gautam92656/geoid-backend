import type { Request, Response, NextFunction } from "express"
import type { LogConfigurationStatus } from "../../../generated/prisma/client"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as logConfigurationService from "../log-configuration/log-configuration.service"
import {
  createLogConfigurationSchema,
  listLogConfigurationsQuerySchema,
  updateLogConfigurationSchema,
} from "../log-configuration/log-configuration.validation"
import * as fieldOptionService from "../log-configuration/log-configuration-field-option.service"
import {
  fieldOptionsRouteParamsSchema,
  parseLogConfigurationFieldGroupFromUrl,
  replaceFieldOptionsSchema,
  resolveFieldKeyForGroup,
} from "../log-configuration/log-configuration-field-option.validation"
import { parsePositiveInt, resolveTargetUserId } from "./admin-target-user"

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const { error, value } = listLogConfigurationsQuerySchema.validate(req.query, {
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

  const data = await logConfigurationService.list({
    userId,
    page: value.page,
    limit: value.limit,
    includeDeleted,
    search: value.search,
    status: value.status as LogConfigurationStatus | undefined,
    sortBy: value.sortBy,
    sortOrder: value.sortOrder,
  })
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await logConfigurationService.getOne(userId, id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const { error, value } = createLogConfigurationSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await logConfigurationService.create(userId, value)
  successResponse(res, data, API_MESSAGES.LOG_CONFIGURATION_ADDED, HTTP_STATUS.CREATED)
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const { error, value } = updateLogConfigurationSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await logConfigurationService.update(userId, id, value)
  successResponse(res, data, API_MESSAGES.LOG_CONFIGURATION_UPDATED, HTTP_STATUS.OK)
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await logConfigurationService.remove(userId, id)
  successResponse(res, data, API_MESSAGES.LOG_CONFIGURATION_DELETED, HTTP_STATUS.OK)
}

export async function getFieldOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const { error, value } = fieldOptionsRouteParamsSchema.validate(req.params, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const fieldGroup = parseLogConfigurationFieldGroupFromUrl(value.fieldGroup)
  const fieldKey = resolveFieldKeyForGroup(fieldGroup, value.fieldKey)
  if (!fieldGroup || !fieldKey) {
    next(new ValidationError("Invalid field group or field key"))
    return
  }

  const data = await fieldOptionService.getFieldOptions(userId, id, fieldGroup, fieldKey)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function replaceFieldOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const { error: paramsError, value: params } = fieldOptionsRouteParamsSchema.validate(req.params, {
    abortEarly: false,
  })
  if (paramsError) {
    next(new ValidationError(paramsError.details.map((d) => d.message).join("; ")))
    return
  }

  const fieldGroup = parseLogConfigurationFieldGroupFromUrl(params.fieldGroup)
  const fieldKey = resolveFieldKeyForGroup(fieldGroup, params.fieldKey)
  if (!fieldGroup || !fieldKey) {
    next(new ValidationError("Invalid field group or field key"))
    return
  }

  const { error: bodyError, value } = replaceFieldOptionsSchema.validate(req.body, {
    abortEarly: false,
  })
  if (bodyError) {
    next(new ValidationError(bodyError.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await fieldOptionService.replaceFieldOptions(
    userId,
    id,
    fieldGroup,
    fieldKey,
    value.options
  )
  successResponse(res, data, API_MESSAGES.LOG_CONFIGURATION_UPDATED, HTTP_STATUS.OK)
}
