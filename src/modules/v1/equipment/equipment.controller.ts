import type { Request, Response, NextFunction } from "express"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as equipmentService from "./equipment.service"
import {
  createEquipmentSchema,
  listEquipmentQuerySchema,
  updateEquipmentSchema,
} from "./equipment.validation"

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

  const { error, value } = listEquipmentQuerySchema.validate(req.query, {
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

  try {
    const data = await equipmentService.list({
      userId,
      page: value.page,
      limit: value.limit,
      includeDeleted,
      search: value.search,
      equipmentTypeId: value.equipmentTypeId,
      sortBy: value.sortBy,
      sortOrder: value.sortOrder,
    })
    successResponse(res, data, undefined, HTTP_STATUS.OK)
  } catch (err) {
    next(err)
  }
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

  try {
    const data = await equipmentService.getOne(id, userId)
    successResponse(res, data, undefined, HTTP_STATUS.OK)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = createEquipmentSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  try {
    const data = await equipmentService.create(userId, value)
    successResponse(res, data, API_MESSAGES.EQUIPMENT_ADDED, HTTP_STATUS.CREATED)
  } catch (err) {
    next(err)
  }
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

  const { error, value } = updateEquipmentSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  try {
    const data = await equipmentService.update(id, userId, value)
    successResponse(res, data, API_MESSAGES.EQUIPMENT_UPDATED, HTTP_STATUS.OK)
  } catch (err) {
    next(err)
  }
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

  try {
    const data = await equipmentService.remove(id, userId)
    successResponse(res, data, API_MESSAGES.EQUIPMENT_DELETED, HTTP_STATUS.OK)
  } catch (err) {
    next(err)
  }
}
