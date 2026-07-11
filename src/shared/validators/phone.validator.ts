import Joi from "joi"
import { USER_PHONE_MAX_LENGTH } from "../constants"

export const PHONE_CODE_REGEX = /^\+[1-9]\d{0,3}$/
export const PHONE_NUMBER_REGEX = /^\d{4,15}$/

export const phoneCodeField = Joi.string()
  .trim()
  .pattern(PHONE_CODE_REGEX)
  .allow(null, "")
  .optional()
  .messages({
    "string.pattern.base": "Phone code must be a valid dial code (e.g. +1, +44, +91, +971)",
  })

export const phoneNumberField = Joi.string()
  .trim()
  .max(USER_PHONE_MAX_LENGTH)
  .pattern(PHONE_NUMBER_REGEX)
  .allow(null, "")
  .optional()
  .messages({
    "string.pattern.base": "Phone number must contain 4 to 15 digits only",
  })

export function validatePhonePair<T extends { phoneCode?: string | null; phoneNumber?: string | null }>(
  value: T,
  helpers: Joi.CustomHelpers<T>,
): T | Joi.ErrorReport {
  const hasPhoneCode = typeof value.phoneCode === "string" && value.phoneCode.trim().length > 0
  const hasPhoneNumber = typeof value.phoneNumber === "string" && value.phoneNumber.trim().length > 0

  if (hasPhoneCode === hasPhoneNumber) {
    return value
  }

  if (hasPhoneNumber) {
    return helpers.message({
      custom: "Phone code is required when phone number is provided",
    })
  }

  return helpers.message({
    custom: "Phone number is required when phone code is provided",
  })
}
