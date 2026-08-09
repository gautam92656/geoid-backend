import type { NextFunction, Request, Response } from "express"
import { ForbiddenError } from "../errors/ForbiddenError"
import type { AuthedRequest } from "../../types/auth"
import * as userRepository from "../../modules/v1/user/users/user.repository"

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  void (async () => {
    try {
      const userId = (req as AuthedRequest).user?.sub
      if (!userId) {
        next(new ForbiddenError("Forbidden: super admin access required"))
        return
      }

      const user = await userRepository.findById(userId)
      if (!user || user.role !== "super_admin") {
        next(new ForbiddenError("Forbidden: super admin access required"))
        return
      }

      next()
    } catch (err) {
      next(err)
    }
  })()
}
