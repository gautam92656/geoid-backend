import { Prisma } from "../../generated/prisma/client"
import { env } from "../../config/env"

function isMissingUserForeignKeyError(err: Prisma.PrismaClientKnownRequestError): boolean {
  if (err.code !== "P2003") return false

  const fieldName = String(err.meta?.field_name ?? "")
  const modelName = String(err.meta?.modelName ?? "")
  return fieldName.includes("user_id") || modelName.toLowerCase().includes("user")
}

function getUniqueConstraintMessage(err: Prisma.PrismaClientKnownRequestError): string {
  const target = err.meta?.target
  if (Array.isArray(target) && target.length > 0) {
    const fields = target.map(String).join(", ")
    return `A record with this ${fields} already exists.`
  }

  return "This record already exists. Please use different values."
}

export function toPrismaUserMessage(err: unknown): string | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (isMissingUserForeignKeyError(err)) {
      return "Unauthorized: user account no longer exists. Please sign in again."
    }

    switch (err.code) {
      case "P2002":
        return getUniqueConstraintMessage(err)
      case "P2025":
        return "The requested record was not found."
      case "P2003":
        return "This action cannot be completed because a related record is missing."
      case "P2014":
        return "This action cannot be completed because related records exist."
      case "P2011":
      case "P2012":
        return "Required information is missing."
      default:
        break
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return "Invalid data provided. Please check your input and try again."
  }

  return null
}

export function toInternalErrorMessage(err: unknown): string {
  const prismaMessage = toPrismaUserMessage(err)
  if (prismaMessage) return prismaMessage

  if (env.NODE_ENV === "production") {
    return "Something went wrong. Please try again."
  }

  return err instanceof Error ? err.message : "Internal server error"
}
