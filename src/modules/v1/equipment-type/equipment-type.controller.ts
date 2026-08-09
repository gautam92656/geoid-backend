import type { Request, Response, NextFunction } from "express"
import type { EquipmentTypeStatus } from "../../../generated/prisma/client"
import type { AuthedRequest } from "../../../types/auth"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as equipmentTypeService from "./equipment-type.service"
import {
  createEquipmentTypeSchema,
  listEquipmentTypesQuerySchema,
  updateEquipmentTypeSchema,
} from "./equipment-type.validation"

function parseId(req: Request): number | null {
  const id = parseInt(String(req.params.id), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

export async function listFieldDefinitions(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await equipmentTypeService.listFieldDefinitions()
    successResponse(res, data, undefined, HTTP_STATUS.OK)
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = listEquipmentTypesQuerySchema.validate(req.query, {
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
    const data = await equipmentTypeService.list({
      userId,
      page: value.page,
      limit: value.limit,
      includeDeleted,
      search: value.search,
      status: value.status as EquipmentTypeStatus | undefined,
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
    const data = await equipmentTypeService.getOne(id, userId)
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

  const { error, value } = createEquipmentTypeSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  try {
    const data = await equipmentTypeService.create(userId, value)
    successResponse(res, data, API_MESSAGES.EQUIPMENT_TYPE_ADDED, HTTP_STATUS.CREATED)
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

  const { error, value } = updateEquipmentTypeSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  try {
    const data = await equipmentTypeService.update(id, userId, value)
    successResponse(res, data, API_MESSAGES.EQUIPMENT_TYPE_UPDATED, HTTP_STATUS.OK)
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
    const data = await equipmentTypeService.remove(id, userId)
    successResponse(res, data, API_MESSAGES.EQUIPMENT_TYPE_DELETED, HTTP_STATUS.OK)
  } catch (err) {
    next(err)
  }
}
