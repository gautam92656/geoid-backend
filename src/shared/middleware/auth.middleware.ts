import type { NextFunction, Request, Response } from "express"
import { HTTP_STATUS } from "../constants"
import { ApiError } from "../errors/ApiError"
import type { AuthedRequest } from "../../types/auth"
import { verifyToken } from "../utils/jwt.util"

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: token is required"))
    return
  }

  const [scheme, token] = authHeader.split(" ")
  if (scheme !== "Bearer" || !token) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: invalid authorization header"))
    return
  }

  try {
    const payload = verifyToken(token)
    ;(req as AuthedRequest).user = { sub: payload.sub, email: payload.email }
    next()
  } catch {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: invalid or expired token"))
  }
}
