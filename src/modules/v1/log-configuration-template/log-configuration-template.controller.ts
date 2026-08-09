import type { Request, Response, NextFunction } from "express"
import type { LogConfigurationTemplateDiscipline } from "../../../generated/prisma/client"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as logConfigurationTemplateService from "./log-configuration-template.service"
import {
  createLogConfigurationTemplateSchema,
  listLogConfigurationTemplatesQuerySchema,
  updateLogConfigurationTemplateSchema,
} from "./log-configuration-template.validation"

function parseId(req: Request): number | null {
  const id = parseInt(String(req.params.id), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = listLogConfigurationTemplatesQuerySchema.validate(req.query, {
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

  const data = await logConfigurationTemplateService.list({
    page: value.page,
    limit: value.limit,
    includeDeleted,
    availableOnly,
    search: value.search,
    region: value.region,
    discipline: value.discipline as LogConfigurationTemplateDiscipline | undefined,
    sortBy: value.sortBy,
    sortOrder: value.sortOrder,
  })
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }
  const data = await logConfigurationTemplateService.getOne(id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = createLogConfigurationTemplateSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }
  const data = await logConfigurationTemplateService.create(value)
  successResponse(res, data, API_MESSAGES.LOG_CONFIGURATION_TEMPLATE_ADDED, HTTP_STATUS.CREATED)
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }
  const { error, value } = updateLogConfigurationTemplateSchema.validate(req.body, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }
  const data = await logConfigurationTemplateService.update(id, value)
  successResponse(res, data, API_MESSAGES.LOG_CONFIGURATION_TEMPLATE_UPDATED, HTTP_STATUS.OK)
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }
  const data = await logConfigurationTemplateService.remove(id)
  successResponse(res, data, API_MESSAGES.LOG_CONFIGURATION_TEMPLATE_DELETED, HTTP_STATUS.OK)
}
