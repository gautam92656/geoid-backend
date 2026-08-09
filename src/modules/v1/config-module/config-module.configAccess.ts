import { ForbiddenError } from "../../../shared/errors/ForbiddenError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { prisma } from "../../../infrastructure/database/prisma"
import * as userRepository from "../user/users/user.repository"

/** Parse and validate a positive integer log configuration id. */
export function parseLogConfigurationId(value: unknown): number {
  const id =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? parseInt(value, 10)
        : NaN

  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError("logConfigurationId is required")
  }

  return id
}

export type LogConfigurationAccess = {
  logConfigurationId: number
  /** User who owns the configuration (module rows are stored under this user). */
  ownerUserId: number
}

/**
 * Ensure the actor can access the target log configuration.
 * Owners always can; super_admins can access any user's configuration.
 * Returns the config id and the owning user id (use ownerUserId for module CRUD).
 */
export async function assertAccessibleLogConfiguration(
  actorUserId: number,
  logConfigurationId: number
): Promise<LogConfigurationAccess> {
  const config = await prisma.logConfiguration.findFirst({
    where: { id: logConfigurationId },
    select: { id: true, userId: true, deletedAt: true },
  })

  if (!config || config.deletedAt) {
    throw new NotFoundError("Log configuration not found")
  }

  if (config.userId === actorUserId) {
    return { logConfigurationId: config.id, ownerUserId: config.userId }
  }

  const actor = await userRepository.findById(actorUserId)
  if (actor?.role === "super_admin") {
    return { logConfigurationId: config.id, ownerUserId: config.userId }
  }

  throw new ForbiddenError("You do not have access to this log configuration.")
}

/** @deprecated Prefer assertAccessibleLogConfiguration — alias kept for call sites. */
export async function assertOwnedLogConfiguration(
  userId: number,
  logConfigurationId: number
): Promise<number> {
  const access = await assertAccessibleLogConfiguration(userId, logConfigurationId)
  return access.logConfigurationId
}
