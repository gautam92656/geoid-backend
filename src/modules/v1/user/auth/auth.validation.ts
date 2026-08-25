import Joi from "joi"
import {
  USER_NAME_MAX_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_COMPANY_NAME_MAX_LENGTH,
  USER_COMPANY_LOGO_URL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  OTP_CODE_LENGTH,
} from "../../../../shared/constants"
import {
  phoneCodeField,
  phoneNumberField,
  validatePhonePair,
} from "../../../../shared/validators/phone.validator"

export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]).+$/

export const signUpSchema = Joi.object({
  firstName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).required(),
  lastName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).required(),
  email: Joi.string().trim().lowercase().email().max(USER_EMAIL_MAX_LENGTH).required(),
  phoneCode: phoneCodeField,
  phoneNumber: phoneNumberField,
  password: Joi.string()
    .trim()
    .min(PASSWORD_MIN_LENGTH)
    .pattern(STRONG_PASSWORD_PATTERN)
    .required()
    .messages({
      "string.min": `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
  confirmPassword: Joi.string().trim().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match password",
    "any.required": "Confirm password is required",
  }),
  termsAndConditions: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the terms and conditions",
    "any.required": "Terms and conditions acceptance is required",
  }),
}).custom(validatePhonePair, "phone pair validation")

export const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(USER_EMAIL_MAX_LENGTH).required(),
  otpCode: Joi.string()
    .trim()
    .length(OTP_CODE_LENGTH)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": `OTP code must be exactly ${OTP_CODE_LENGTH} digits`,
      "string.pattern.base": "OTP code must contain digits only",
      "any.required": "OTP code is required",
    }),
})

export const resendOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(USER_EMAIL_MAX_LENGTH).required(),
  otpType: Joi.string().valid("register", "forgot_password").required(),
})

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(USER_EMAIL_MAX_LENGTH).required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().trim().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
  }),
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(USER_EMAIL_MAX_LENGTH).required(),
})

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(USER_EMAIL_MAX_LENGTH).required(),
  newPassword: Joi.string()
    .trim()
    .min(PASSWORD_MIN_LENGTH)
    .pattern(STRONG_PASSWORD_PATTERN)
    .required()
    .messages({
      "string.min": `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "New password is required",
    }),
  confirmPassword: Joi.string().trim().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Confirm password must match new password",
    "any.required": "Confirm password is required",
  }),
})

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().trim().required().messages({
    "any.required": "Current password is required",
    "string.empty": "Current password is required",
  }),
  newPassword: Joi.string()
    .trim()
    .min(PASSWORD_MIN_LENGTH)
    .pattern(STRONG_PASSWORD_PATTERN)
    .not(Joi.ref("currentPassword"))
    .required()
    .messages({
      "string.min": `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.invalid": "New password must be different from your current password",
      "any.required": "New password is required",
    }),
  confirmPassword: Joi.string().trim().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Confirm password must match new password",
    "any.required": "Confirm password is required",
  }),
})

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(USER_NAME_MAX_LENGTH).optional(),
  lastName: Joi.string().trim().min(1).max(USER_NAME_MAX_LENGTH).optional(),
  email: Joi.string().trim().lowercase().email().max(USER_EMAIL_MAX_LENGTH).optional(),
  companyLogoUrl: Joi.string()
    .trim()
    .max(USER_COMPANY_LOGO_URL_MAX_LENGTH)
    .allow("", null)
    .optional(),
  companyName: Joi.string().trim().max(USER_COMPANY_NAME_MAX_LENGTH).allow("", null).optional(),
}).min(1)
