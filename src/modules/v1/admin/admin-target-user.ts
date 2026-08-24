import type { Request, NextFunction } from "express"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as userRepository from "../user/users/user.repository"

export function parsePositiveInt(value: unknown): number | null {
  const id = parseInt(String(value), 10)
  return Number.isNaN(id) || id < 1 ? null : id
}

/** Resolve `:userId` route param to a real user, or call next with an error. */
export async function resolveTargetUserId(
  req: Request,
  next: NextFunction
): Promise<number | null> {
  const userId = parsePositiveInt(req.params.userId)
  if (!userId) {
    next(new ValidationError("Invalid user ID"))
    return null
  }

  const user = await userRepository.findById(userId)
  if (!user) {
    next(new NotFoundError("User not found"))
    return null
  }

  return userId
}
