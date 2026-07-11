import type { Request, Response, NextFunction } from "express"
import type { AuthedRequest } from "../../../../types/auth"
import { successResponse } from "../../../../shared/utils/apiResponse"
import { HTTP_STATUS } from "../../../../shared/constants"
import { ValidationError } from "../../../../shared/errors/ValidationError"
import * as authService from "./auth.service"
import {
  forgotPasswordSchema,
  loginSchema,
  resendOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  signUpSchema,
  verifyOtpSchema,
} from "./auth.validation"

export async function signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = signUpSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }
  const result = await authService.signUp(value, res.locals.lang)
  successResponse(res, result, result.message, HTTP_STATUS.CREATED)
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }
  const lang = res.locals.lang
  const result = await authService.login(value, lang)
  if ("otpSent" in result && result.otpSent === true) {
    successResponse(res, result, result.message, HTTP_STATUS.OK)
    return
  }
  successResponse(res, result, undefined, HTTP_STATUS.OK)
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = verifyOtpSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const result = await authService.verifyOtp(value, res.locals.lang)
  successResponse(res, result, result.message, HTTP_STATUS.OK)
}

export async function resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = resendOtpSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const result = await authService.resendOtp(value, res.locals.lang)
  successResponse(res, result, result.message, HTTP_STATUS.OK)
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const result = await authService.forgotPassword(value, res.locals.lang)
  successResponse(res, result, result.message, HTTP_STATUS.OK)
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const result = await authService.resetPassword(value, res.locals.lang)
  successResponse(res, result, result.message, HTTP_STATUS.OK)
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const userId = (req as AuthedRequest).user!.sub
  const result = await authService.changePassword(userId, value, res.locals.lang)
  successResponse(res, result, result.message, HTTP_STATUS.OK)
}
