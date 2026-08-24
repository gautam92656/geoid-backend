import type { Request, Response, NextFunction } from "express"
import type { LogReportTemplateLogType } from "../../../generated/prisma/client"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as logReportTemplateService from "../log-report-template/log-report-template.service"
import {
  createLogReportTemplateSchema,
  listLogReportTemplatesQuerySchema,
  reorderLogReportTemplatesSchema,
  updateLogReportTemplateSchema,
} from "../log-report-template/log-report-template.validation"
import { parsePositiveInt, resolveTargetUserId } from "./admin-target-user"

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const { error, value } = listLogReportTemplatesQuerySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

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

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await logReportTemplateService.getOne(userId, id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

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
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
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
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const id = parsePositiveInt(req.params.id)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await logReportTemplateService.remove(userId, id)
  successResponse(res, data, API_MESSAGES.LOG_REPORT_TEMPLATE_DELETED, HTTP_STATUS.OK)
}

export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveTargetUserId(req, next)
  if (!userId) return

  const { error, value } = reorderLogReportTemplatesSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  await logReportTemplateService.reorder(userId, value.orderedIds)
  successResponse(res, { ok: true }, API_MESSAGES.LOG_REPORT_TEMPLATE_UPDATED, HTTP_STATUS.OK)
}
