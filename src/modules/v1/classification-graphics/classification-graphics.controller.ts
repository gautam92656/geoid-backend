import type { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../../../shared/constants"
import { successResponse } from "../../../shared/utils/apiResponse"
import * as classificationGraphicsService from "./classification-graphics.service"

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await classificationGraphicsService.listClassificationGraphics()
    successResponse(res, data, "", HTTP_STATUS.OK)
  } catch (error) {
    next(error)
  }
}
