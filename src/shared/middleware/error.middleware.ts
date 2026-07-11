import type { Request, Response, NextFunction } from "express"
import { ApiError } from "../errors/ApiError"
import logger from "../../config/logger"
import { env } from "../../config/env"

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  logger.error({ err }, err.message)

  const statusCode = 500
  const message =
    env.NODE_ENV === "production" ? "Internal server error" : err.message

  res.status(statusCode).json({ error: message })
}
