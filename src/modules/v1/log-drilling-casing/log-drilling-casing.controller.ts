import type { Request, Response, NextFunction } from "express"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as casingService from "./log-drilling-casing.service"
import {
  createLogDrillingCasingSchema,
  listLogDrillingCasingsQuerySchema,
  projectLogParamsSchema,
  updateLogDrillingCasingSchema,
} from "./log-drilling-casing.validation"

function parseId(value: string): number | null {
  const id = parseInt(value, 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

function getProjectLogIds(req: Request): { projectId: number; logId: number } | null {
  const { error, value } = projectLogParamsSchema.validate(
    {
      projectId: parseId(String(req.params.projectId)),
      logId: parseId(String(req.params.logId)),
    },
    { convert: true }
  )
  if (error) return null
  return { projectId: value.projectId, logId: value.logId }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const ids = getProjectLogIds(req)
  if (!ids) {
    next(new ValidationError("Invalid project or log ID"))
    return
  }

  const { error, value } = listLogDrillingCasingsQuerySchema.validate(req.query, {
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

  let onlyDeleted: boolean | undefined
  if (value.onlyDeleted === "true") onlyDeleted = true
  else if (value.onlyDeleted === "false") onlyDeleted = false

  const data = await casingService.list({
    userId,
    projectId: ids.projectId,
    logId: ids.logId,
    page: value.page,
    limit: value.limit,
    includeDeleted,
    onlyDeleted,
    search: value.search,
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

  const ids = getProjectLogIds(req)
  const id = parseId(String(req.params.id))
  if (!ids || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await casingService.getOne(userId, ids.projectId, ids.logId, id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const ids = getProjectLogIds(req)
  if (!ids) {
    next(new ValidationError("Invalid project or log ID"))
    return
  }

  const { error, value } = createLogDrillingCasingSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await casingService.create(userId, ids.projectId, ids.logId, value)
  successResponse(res, data, API_MESSAGES.LOG_DRILLING_CASING_ADDED, HTTP_STATUS.CREATED)
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const ids = getProjectLogIds(req)
  const id = parseId(String(req.params.id))
  if (!ids || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const { error, value } = updateLogDrillingCasingSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await casingService.update(userId, ids.projectId, ids.logId, id, value)
  successResponse(res, data, API_MESSAGES.LOG_DRILLING_CASING_UPDATED, HTTP_STATUS.OK)
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const ids = getProjectLogIds(req)
  const id = parseId(String(req.params.id))
  if (!ids || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await casingService.remove(userId, ids.projectId, ids.logId, id)
  successResponse(res, data, API_MESSAGES.LOG_DRILLING_CASING_DELETED, HTTP_STATUS.OK)
}

export async function restore(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const ids = getProjectLogIds(req)
  const id = parseId(String(req.params.id))
  if (!ids || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await casingService.restoreCasing(userId, ids.projectId, ids.logId, id)
  successResponse(res, data, API_MESSAGES.LOG_DRILLING_CASING_RESTORED, HTTP_STATUS.OK)
}

export async function copy(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const ids = getProjectLogIds(req)
  const id = parseId(String(req.params.id))
  if (!ids || !id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await casingService.copy(userId, ids.projectId, ids.logId, id)
  successResponse(res, data, API_MESSAGES.LOG_DRILLING_CASING_ADDED, HTTP_STATUS.CREATED)
}
