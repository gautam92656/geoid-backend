import type { Request, Response, NextFunction } from "express"
import type { ProjectStatus } from "../../../generated/prisma/client"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as projectService from "./project.service"
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "./project.validation"

function parseId(req: Request): number | null {
  const id = parseInt(String(req.params.id), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = listProjectsQuerySchema.validate(req.query, {
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

  const data = await projectService.list({
    userId,
    page: value.page,
    limit: value.limit,
    includeDeleted,
    listScope: value.listScope,
    search: value.search,
    status: value.status as ProjectStatus | undefined,
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
  const data = await projectService.getOne(userId, id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getByProjectNo(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const projectNo = decodeURIComponent(String(req.params.projectNo ?? "")).trim()
  if (!projectNo) {
    next(new ValidationError("Invalid project number"))
    return
  }

  const data = await projectService.getByProjectNo(userId, projectNo)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = createProjectSchema.validate(
    { ...req.body, userId },
    { abortEarly: false, stripUnknown: true, convert: false }
  )
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const { userId: validatedUserId, ...projectInput } = value
  if (validatedUserId !== userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const data = await projectService.create(userId, projectInput)
  successResponse(res, data, API_MESSAGES.PROJECT_ADDED, HTTP_STATUS.CREATED)
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
  const { error, value } = updateProjectSchema.validate(req.body, {
    abortEarly: false,
    convert: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }
  const data = await projectService.update(userId, id, value)
  successResponse(res, data, API_MESSAGES.PROJECT_UPDATED, HTTP_STATUS.OK)
}

export async function archive(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  const data = await projectService.archive(userId, id)
  successResponse(res, data, API_MESSAGES.PROJECT_ARCHIVED, HTTP_STATUS.OK)
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
  const data = await projectService.remove(userId, id)
  successResponse(res, data, API_MESSAGES.PROJECT_DELETED, HTTP_STATUS.OK)
}
