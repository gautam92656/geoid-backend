import type { Request, Response, NextFunction } from "express"
import type { UserRole } from "../../../generated/prisma/client"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as adminUserService from "./admin-user.service"
import {
  createAdminUserSchema,
  listAdminUsersQuerySchema,
  updateAdminUserSchema,
} from "./admin-user.validation"

function parseId(req: Request): number | null {
  const id = parseInt(String(req.params.id), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = listAdminUsersQuerySchema.validate(req.query, {
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

  let isEmailVerified: boolean | undefined
  if (value.isEmailVerified === "true") isEmailVerified = true
  else if (value.isEmailVerified === "false") isEmailVerified = false

  const data = await adminUserService.list({
    page: value.page,
    limit: value.limit,
    includeDeleted,
    search: value.search,
    role: value.role as UserRole | undefined,
    isEmailVerified,
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
  const data = await adminUserService.getOne(id)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = createAdminUserSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }
  const data = await adminUserService.create(value)
  successResponse(res, data, API_MESSAGES.USER_ADDED, HTTP_STATUS.CREATED)
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const actorUserId = getUserId(req)
  if (!actorUserId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const { error, value } = updateAdminUserSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await adminUserService.update(id, value, actorUserId)
  successResponse(res, data, API_MESSAGES.USER_UPDATED, HTTP_STATUS.OK)
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const actorUserId = getUserId(req)
  if (!actorUserId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const id = parseId(req)
  if (!id) {
    next(new ValidationError("Invalid ID"))
    return
  }

  const data = await adminUserService.remove(id, actorUserId)
  successResponse(res, data, API_MESSAGES.USER_DELETED, HTTP_STATUS.OK)
}
