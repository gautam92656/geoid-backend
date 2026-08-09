import type { NextFunction, Request, Response } from "express"
import { HTTP_STATUS } from "../constants"
import { ApiError } from "../errors/ApiError"
import type { AuthedRequest } from "../../types/auth"
import { verifyToken } from "../utils/jwt.util"
import { parseAuthUserId } from "../utils/auth.util"
import * as userRepository from "../../modules/v1/user/users/user.repository"

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  void (async () => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: token is required")
      }

      const [scheme, token] = authHeader.split(" ")
      if (scheme !== "Bearer" || !token) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: invalid authorization header")
      }

      const payload = verifyToken(token)
      const userId = parseAuthUserId(payload.sub)
      if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: invalid token subject")
      }

      const user = await userRepository.findById(userId)
      if (!user) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "Unauthorized: user account no longer exists. Please sign in again."
        )
      }

      ;(req as AuthedRequest).user = { sub: user.id, email: user.email, role: user.role }
      next()
    } catch (err) {
      if (err instanceof ApiError) {
        next(err)
        return
      }
      next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: invalid or expired token"))
    }
  })()
}
