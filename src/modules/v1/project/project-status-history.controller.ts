import type { Request, Response, NextFunction } from "express"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as statusHistoryService from "./project-status-history.service"
import {
  createProjectStatusHistorySchema,
  projectIdParamSchema,
} from "./project-status-history.validation"

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

  const data = await statusHistoryService.list(userId, projectId)
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

  const { error, value } = createProjectStatusHistorySchema.validate(req.body, {
    abortEarly: false,
    convert: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await statusHistoryService.addStatusUpdate(userId, projectId, value.status)
  successResponse(res, data, API_MESSAGES.PROJECT_STATUS_UPDATED, HTTP_STATUS.OK)
}
