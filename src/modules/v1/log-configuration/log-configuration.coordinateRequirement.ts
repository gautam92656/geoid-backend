import { ValidationError } from "../../../shared/errors/ValidationError"
import * as logConfigRepo from "./log-configuration.repository"

const DEFAULT_COORDINATE_REQUIREMENT = "can-be-null"

/**
 * Resolve Coordinate Requirement from the user's log configuration.
 * Falls back to can-be-null when the config is missing or invalid.
 */
export async function resolveCoordinateRequirementForUser(
  userId: number,
  logConfigId?: string | null
): Promise<string> {
  const trimmed = logConfigId?.trim()
  if (!trimmed) return DEFAULT_COORDINATE_REQUIREMENT

  const numericId = Number.parseInt(trimmed, 10)
  if (!Number.isInteger(numericId) || numericId < 1) {
    return DEFAULT_COORDINATE_REQUIREMENT
  }

  const config = await logConfigRepo.findByIdForUser(numericId, userId)
  if (!config || config.deletedAt) {
    return DEFAULT_COORDINATE_REQUIREMENT
  }

  return config.coordinateRequirement?.trim() || DEFAULT_COORDINATE_REQUIREMENT
}

/**
 * Enforce latitude/longitude only when the log configuration requires coordinates.
 */
export function assertCoordinatesForRequirement(
  requirement: string,
  latitude?: string | null,
  longitude?: string | null
): void {
  if (requirement !== "required") return

  if (!latitude?.trim()) {
    throw new ValidationError("Latitude is required.")
  }
  if (!longitude?.trim()) {
    throw new ValidationError("Longitude is required.")
  }
}
