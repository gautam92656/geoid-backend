import type { Request, Response, NextFunction } from "express"
import type { LogStatus } from "../../../generated/prisma/client"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as logService from "./log.service"
import {
  createLogSchema,
  listLogsQuerySchema,
  projectIdParamSchema,
  updateLogSchema,
} from "./log.validation"

function parseId(value: string): number | null {
  const id = parseInt(value, 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

function getProjectId(req: Request): number | null {
  const { error, value } = projectIdParamSchema.validate(
    { projectId: parseId(String(req.params.projectId)) },
    { convert: true }
  )
  if (error) return null
  return value.projectId
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const projectId = getProjectId(req)
  if (!projectId) {
    next(new ValidationError("Invalid project ID"))
    return
  }

  const { error, value } = listLogsQuerySchema.validate(req.query, {
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

  const data = await logService.list({
    userId,
    projectId,
    page: value.page,
    limit: value.limit,
    includeDeleted,
    search: value.search,
    status: value.status as LogStatus | undefined,
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

  const projectId = getProjectId(req)
  const id = parseId(String(req.params.id))
  if (!projectId || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await logService.getOne(userId, projectId, id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const projectId = getProjectId(req)
  if (!projectId) {
    next(new ValidationError("Invalid project ID"))
    return
  }

  const { error, value } = createLogSchema.validate(
    { ...req.body, userId, projectId },
    { abortEarly: false, stripUnknown: true, convert: false }
  )
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const { userId: validatedUserId, projectId: validatedProjectId, ...logInput } = value
  if (validatedUserId !== userId || validatedProjectId !== projectId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const data = await logService.create(userId, projectId, logInput)
  successResponse(res, data, API_MESSAGES.LOG_ADDED, HTTP_STATUS.CREATED)
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const projectId = getProjectId(req)
  const id = parseId(String(req.params.id))
  if (!projectId || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const { error, value } = updateLogSchema.validate(req.body, {
    abortEarly: false,
    convert: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await logService.update(userId, projectId, id, value)
  successResponse(res, data, API_MESSAGES.LOG_UPDATED, HTTP_STATUS.OK)
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const projectId = getProjectId(req)
  const id = parseId(String(req.params.id))
  if (!projectId || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await logService.remove(userId, projectId, id)
  successResponse(res, data, API_MESSAGES.LOG_DELETED, HTTP_STATUS.OK)
}
