import type { Request } from "express"
import type { AuthedRequest } from "../../types/auth"

export function parseAuthUserId(sub: unknown): number | null {
  if (typeof sub === "number" && Number.isInteger(sub) && sub > 0) {
    return sub
  }

  if (typeof sub === "string") {
    const trimmed = sub.trim()
    if (!/^\d+$/.test(trimmed)) return null
    const parsed = Number.parseInt(trimmed, 10)
    return parsed > 0 ? parsed : null
  }

  return null
}

export function getAuthedUserId(req: Request): number | null {
  return parseAuthUserId((req as AuthedRequest).user?.sub)
}
