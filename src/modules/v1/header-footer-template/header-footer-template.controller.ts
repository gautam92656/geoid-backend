import type { Request, Response, NextFunction } from "express"
import type { HeaderFooterReportType, HeaderFooterTemplateKind } from "../../../generated/prisma/client"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as headerFooterTemplateService from "./header-footer-template.service"
import {
  createHeaderFooterTemplateSchema,
  listHeaderFooterTemplatesQuerySchema,
  updateHeaderFooterTemplateSchema,
} from "./header-footer-template.validation"

function parseId(req: Request): number | null {
  const id = parseInt(String(req.params.id), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

function normalizeReportType(value: unknown): HeaderFooterReportType | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  return value as HeaderFooterReportType
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = listHeaderFooterTemplatesQuerySchema.validate(req.query, {
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

  const data = await headerFooterTemplateService.list({
    userId,
    page: value.page,
    limit: value.limit,
    includeDeleted,
    search: value.search,
    kind: value.kind as HeaderFooterTemplateKind | undefined,
    sortBy: value.sortBy,
    sortOrder: value.sortOrder,
  })
  successResponse(res, data, undefined, HTTP_STATUS.OK)
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
  const data = await headerFooterTemplateService.getOne(userId, id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = createHeaderFooterTemplateSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await headerFooterTemplateService.create(userId, {
    name: value.name,
    kind: value.kind as HeaderFooterTemplateKind,
    reportType: normalizeReportType(value.reportType),
    content: value.content,
  })
  successResponse(res, data, API_MESSAGES.HEADER_FOOTER_TEMPLATE_ADDED, HTTP_STATUS.CREATED)
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
  const { error, value } = updateHeaderFooterTemplateSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await headerFooterTemplateService.update(userId, id, {
    name: value.name,
    kind: value.kind as HeaderFooterTemplateKind | undefined,
    reportType: normalizeReportType(value.reportType),
    content: value.content,
  })
  successResponse(res, data, API_MESSAGES.HEADER_FOOTER_TEMPLATE_UPDATED, HTTP_STATUS.OK)
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
  const data = await headerFooterTemplateService.remove(userId, id)
  successResponse(res, data, API_MESSAGES.HEADER_FOOTER_TEMPLATE_DELETED, HTTP_STATUS.OK)
}
