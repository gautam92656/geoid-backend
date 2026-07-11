import type { Response } from "express"
import { HTTP_STATUS } from "../constants"
import type { ApiResponse } from "../types"

export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): void {
  const body: ApiResponse<T> = { success: true, data }
  if (message) body.message = message
  res.status(statusCode).json(body)
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = HTTP_STATUS.BAD_REQUEST
): void {
  res.status(statusCode).json({ success: false, message } as ApiResponse<never>)
}
