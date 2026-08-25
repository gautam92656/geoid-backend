import crypto from "crypto"
import bcrypt from "bcrypt"
import { BCRYPT_SALT_ROUNDS, HTTP_STATUS, OTP_CODE_LENGTH, OTP_EXPIRY_MINUTES } from "../../../../shared/constants"
import { ApiError } from "../../../../shared/errors/ApiError"
import { NotFoundError } from "../../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../../shared/errors/ValidationError"
import * as userRepository from "../users/user.repository"
import * as otpRepository from "../otp/otp.repository"
import { sendOtpEmail } from "../../../../shared/services/email.service"
import { addOrUpdateSubscriber } from "../../../../shared/services/mailchimp.service"
import { generateToken } from "../../../../shared/utils/jwt.util"
import * as userService from "../users/user.service"
import { OtpType } from "../../../../generated/prisma/enums"
import type {
  ForgotPasswordInput,
  ForgotPasswordResult,
  LoginInput,
  LoginResult,
  ResetPasswordInput,
  ResetPasswordResult,
  ResendOtpInput,
  ResendOtpResult,
  SignUpInput,
  SignUpResult,
  VerifyOtpInput,
  VerifyOtpResult,
  ChangePasswordInput,
  ChangePasswordResult,
} from "./auth.types"
import type { CreateUserRecord } from "../users/user.types"
import { toUserDTO } from "../users/user.mapper"
import { t } from "../../../../shared/i18n/messages"
import type { UserAppLanguage } from "../../../../shared/constants"

function generateOtpCode(): string {
  return crypto.randomInt(10 ** (OTP_CODE_LENGTH - 1), 10 ** OTP_CODE_LENGTH).toString()
}

export async function signUp(input: SignUpInput, lang: UserAppLanguage = "en"): Promise<SignUpResult> {
  const existing = await userRepository.findByEmail(input.email)
  if (existing) throw new ValidationError(t(lang, "auth.email_already_exists"))

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)

  const record: CreateUserRecord = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phoneCode: input.phoneCode?.trim() || null,
    phoneNumber: input.phoneNumber?.trim() || null,
    passwordHash,
    termsAndConditions: input.termsAndConditions,
  }

  await userRepository.create(record)

  await otpRepository.invalidateByEmailAndType(input.email, OtpType.register)

  const otpCode = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
  await otpRepository.create({ email: input.email, otpCode, otpType: OtpType.register, expiresAt })

  await sendOtpEmail(input.email, input.firstName, otpCode)

  return {
    message: t(lang, "auth.signup.success"),
    email: input.email,
  }
}

export async function verifyOtp(input: VerifyOtpInput, lang: UserAppLanguage = "en"): Promise<VerifyOtpResult> {
  const user = await userRepository.findByEmail(input.email)

  if (!user) {
    throw new ValidationError(t(lang, "auth.user_not_found"))
  }

  const token = generateToken({ sub: user.id, email: user.email })

  if (user.isEmailVerified) {
    return {
      message: t(lang, "auth.otp.already_verified"),
      email: user.email,
      isEmailVerified: true,
      token,
      user: toUserDTO(user),
    }
  }

  const otp = await otpRepository.findLatestUnusedValid(input.email, OtpType.register)
  if (!otp || otp.otpCode !== input.otpCode.trim()) {
    throw new ValidationError(t(lang, "auth.otp.invalid"))
  }

  await otpRepository.markUsed(otp.id)
  await otpRepository.invalidateByEmailAndType(input.email, OtpType.register)
  await userRepository.update(user.id, { isEmailVerified: true })

  // Fire-and-forget — subscribe the verified user to the Mailchimp audience
  addOrUpdateSubscriber({ email: user.email, firstName: user.firstName, lastName: user.lastName, tags: ["app-user"] })

  const verifiedUser = { ...user, isEmailVerified: true }

  return {
    message: t(lang, "auth.otp.verified"),
    email: user.email,
    isEmailVerified: true,
    token,
    user: toUserDTO(verifiedUser),
  }
}

export async function resendOtp(input: ResendOtpInput, lang: UserAppLanguage = "en"): Promise<ResendOtpResult> {
  const user = await userRepository.findByEmail(input.email)
  if (!user) {
    throw new ValidationError(t(lang, "auth.user_not_found"))
  }

  if (input.otpType === "register" && user.isEmailVerified) {
    throw new ValidationError(t(lang, "auth.otp.already_verified"))
  }

  const otpType = input.otpType === "forgot_password" ? OtpType.forgot_password : OtpType.register

  await otpRepository.invalidateByEmailAndType(input.email, otpType)

  const otpCode = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
  await otpRepository.create({ email: input.email, otpCode, otpType, expiresAt })

  await sendOtpEmail(input.email, user.firstName, otpCode)

  return {
    message: t(lang, "auth.otp.resent"),
    email: input.email,
  }
}

export async function forgotPassword(input: ForgotPasswordInput, lang: UserAppLanguage = "en"): Promise<ForgotPasswordResult> {
  const user = await userRepository.findByEmail(input.email)

  // Return a generic success response even when account is missing.
  if (!user) {
    return {
      message: t(lang, "auth.forgot_password.sent"),
      email: input.email,
    }
  }

  await otpRepository.invalidateByEmailAndType(input.email, OtpType.forgot_password)

  const otpCode = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
  await otpRepository.create({
    email: input.email,
    otpCode,
    otpType: OtpType.forgot_password,
    expiresAt,
  })

  await sendOtpEmail(input.email, user.firstName, otpCode)

  return {
    message: t(lang, "auth.forgot_password.sent"),
    email: input.email,
  }
}

export async function login(input: LoginInput, lang: UserAppLanguage = "en"): Promise<LoginResult> {
  const user = await userRepository.findByEmail(input.email)

  // Use a generic message for both "not found" and "wrong password" to avoid account enumeration
  if (!user) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, t(lang, "auth.login.invalid_credentials"))

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash)
  if (!isPasswordValid) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, t(lang, "auth.login.invalid_credentials"))

  if (!user.isEmailVerified) {
    await otpRepository.invalidateByEmailAndType(input.email, OtpType.register)

    const otpCode = generateOtpCode()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
    await otpRepository.create({ email: input.email, otpCode, otpType: OtpType.register, expiresAt })

    await sendOtpEmail(input.email, user.firstName, otpCode)

    return {
      message: t(lang, "auth.login.unverified_otp_sent"),
      email: user.email,
      otpSent: true,
    }
  }

  const token = generateToken({ sub: user.id, email: user.email })

  const userDetail = await userService.getById(user.id)
  return { token, user: userDetail }
}

export async function resetPassword(input: ResetPasswordInput, lang: UserAppLanguage = "en"): Promise<ResetPasswordResult> {
  const user = await userRepository.findByEmail(input.email)
  if (!user) {
    throw new ValidationError(t(lang, "auth.invalid_reset"))
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS)
  await userRepository.update(user.id, {}, passwordHash)

  return {
    message: t(lang, "auth.password.reset_success"),
    email: user.email,
  }
}

/** Existing access tokens are not revoked; they remain valid until they expire. */
export async function changePassword(userId: number, input: ChangePasswordInput, lang: UserAppLanguage = "en"): Promise<ChangePasswordResult> {
  const user = await userRepository.findById(userId)
  if (!user) throw new NotFoundError(t(lang, "auth.user_not_found"))

  const isCurrentValid = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!isCurrentValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, t(lang, "auth.password.current_incorrect"))
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS)
  await userRepository.update(userId, {}, passwordHash)

  return { message: t(lang, "auth.password.change_success") }
}

export type UpdateProfileInput = {
  firstName?: string
  lastName?: string
  email?: string
  companyLogoUrl?: string | null
  companyName?: string | null
}

export async function updateProfile(
  userId: number,
  input: UpdateProfileInput,
  lang: UserAppLanguage = "en"
) {
  const user = await userRepository.findById(userId)
  if (!user) throw new NotFoundError(t(lang, "auth.user_not_found"))

  const normalize = (value: string | null | undefined) => {
    if (value === undefined) return undefined
    if (value === null) return null
    const trimmed = value.trim()
    return trimmed || null
  }

  if (input.email && input.email.toLowerCase() !== user.email.toLowerCase()) {
    const duplicate = await userRepository.findByEmail(input.email)
    if (duplicate && duplicate.id !== userId) {
      throw new ValidationError(t(lang, "profile.email_in_use"))
    }
  }

  const nextCompanyName =
    input.companyName !== undefined ? normalize(input.companyName) ?? null : user.companyName
  if (user.role === "user" && !nextCompanyName) {
    throw new ValidationError("Company name is required.")
  }

  const updated = await userRepository.update(userId, {
    ...(input.firstName !== undefined ? { firstName: input.firstName.trim() } : {}),
    ...(input.lastName !== undefined ? { lastName: input.lastName.trim() } : {}),
    ...(input.email !== undefined ? { email: input.email.trim().toLowerCase() } : {}),
    ...(input.companyLogoUrl !== undefined
      ? { companyLogoUrl: normalize(input.companyLogoUrl) ?? null }
      : {}),
    ...(input.companyName !== undefined ? { companyName: nextCompanyName } : {}),
  })

  return {
    message: t(lang, "profile.updated"),
    user: toUserDTO(updated),
  }
}
