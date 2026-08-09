import type { Request, Response, NextFunction } from "express"
import { Prisma } from "../../generated/prisma/client"
import { ApiError } from "../errors/ApiError"
import { HTTP_STATUS } from "../constants"
import logger from "../../config/logger"
import { toInternalErrorMessage, toPrismaUserMessage } from "../utils/prismaError.util"

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

  const prismaMessage = toPrismaUserMessage(err)
  if (prismaMessage) {
    const statusCode =
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003" &&
      prismaMessage.startsWith("Unauthorized")
        ? HTTP_STATUS.UNAUTHORIZED
        : HTTP_STATUS.BAD_REQUEST

    res.status(statusCode).json({ error: prismaMessage })
    return
  }

  logger.error({ err }, err.message)

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: toInternalErrorMessage(err),
  })
}
