import type { UserDTO } from "../users/user.types"

export interface SignUpInput {
  firstName: string
  lastName: string
  email: string
  phoneCode?: string | null
  phoneNumber?: string | null
  password: string
  confirmPassword: string
  termsAndConditions: boolean
}

export interface SignUpResult {
  message: string
  email: string
}

export interface VerifyOtpInput {
  email: string
  otpCode: string
}

export interface VerifyOtpResult {
  message: string
  email: string
  isEmailVerified: boolean
  token: string
  user: UserDTO
}

export interface ResendOtpInput {
  email: string
  otpType: "register" | "forgot_password"
}

export interface ResendOtpResult {
  message: string
  email: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ForgotPasswordResult {
  message: string
  email: string
}

export interface ResetPasswordInput {
  email: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordResult {
  message: string
  email: string
}

export interface LoginInput {
  email: string
  password: string
}

export type LoginResult =
  | {
      token: string
      user: UserDTO
    }
  | {
      message: string
      email: string
      otpSent: true
    }

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResult {
  message: string
}
