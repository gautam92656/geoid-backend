import type { Request, Response, NextFunction } from "express"
import type { LogReportTemplateLogType } from "../../../generated/prisma/client"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as logReportTemplateService from "./log-report-template.service"
import {
  createLogReportTemplateSchema,
  listLogReportTemplatesQuerySchema,
  reorderLogReportTemplatesSchema,
  updateLogReportTemplateSchema,
} from "./log-report-template.validation"

function parseId(req: Request): number | null {
  const id = parseInt(String(req.params.id), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

/** Tablogs: GET /log-template/list — user-scoped grouped templates. */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = listLogReportTemplatesQuerySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  // Default: Tablogs-style grouped payload for the manage modal / builder bootstrap.
  if (value.grouped !== "false") {
    const data = await logReportTemplateService.listGrouped(userId)
    successResponse(res, data, API_MESSAGES.LOG_REPORT_TEMPLATE_LISTED, HTTP_STATUS.OK)
    return
  }

  let includeDeleted: boolean | undefined
  if (value.includeDeleted === "true") includeDeleted = true
  else if (value.includeDeleted === "false") includeDeleted = false

  const data = await logReportTemplateService.list({
    userId,
    page: value.page,
    limit: value.limit,
    includeDeleted,
    search: value.search,
    logType: value.logType as LogReportTemplateLogType | undefined,
    sortBy: value.sortBy,
    sortOrder: value.sortOrder,
  })
  successResponse(res, data, API_MESSAGES.LOG_REPORT_TEMPLATE_LISTED, HTTP_STATUS.OK)
}

/** Tablogs: GET /log-template/builder-configuration */
export async function builderConfiguration(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const data = await logReportTemplateService.getBuilderConfiguration()
  successResponse(res, data, API_MESSAGES.LOG_REPORT_BUILDER_CONFIG, HTTP_STATUS.OK)
}

/** Tablogs: GET /log-template/edit/:id */
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
  const data = await logReportTemplateService.getOne(userId, id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = createLogReportTemplateSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await logReportTemplateService.create(userId, {
    name: value.name,
    logType: value.logType as LogReportTemplateLogType,
    isDefault: value.isDefault,
    config: value.config,
    logConfigurationIds: value.logConfigurationIds,
    templateVersion: value.templateVersion,
  })
  successResponse(res, data, API_MESSAGES.LOG_REPORT_TEMPLATE_ADDED, HTTP_STATUS.CREATED)
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

  const { error, value } = updateLogReportTemplateSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await logReportTemplateService.update(userId, id, {
    name: value.name,
    logType: value.logType as LogReportTemplateLogType | undefined,
    isDefault: value.isDefault,
    config: value.config,
    logConfigurationIds: value.logConfigurationIds,
    templateVersion: value.templateVersion,
    sortOrder: value.sortOrder,
  })
  successResponse(res, data, API_MESSAGES.LOG_REPORT_TEMPLATE_UPDATED, HTTP_STATUS.OK)
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
  const data = await logReportTemplateService.remove(userId, id)
  successResponse(res, data, API_MESSAGES.LOG_REPORT_TEMPLATE_DELETED, HTTP_STATUS.OK)
}

export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = reorderLogReportTemplatesSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await logReportTemplateService.reorder(userId, value.orderedIds)
  successResponse(res, data, API_MESSAGES.LOG_REPORT_TEMPLATE_UPDATED, HTTP_STATUS.OK)
}
