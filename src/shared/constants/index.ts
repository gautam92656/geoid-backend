export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

export const USER_NAME_MAX_LENGTH = 50
export const USER_EMAIL_MAX_LENGTH = 255
export const USER_PHONE_MAX_LENGTH = 20
export const PHONE_CODE_MAX_LENGTH = 10
export const PASSWORD_MIN_LENGTH = 8

export const FAQ_QUESTION_MAX_LENGTH = 500
export const FAQ_ANSWER_MAX_LENGTH = 5000
export const BCRYPT_SALT_ROUNDS = 10
export const OTP_CODE_LENGTH = 4
export const OTP_EXPIRY_MINUTES = 10

export const SMTP_CONNECTION_TIMEOUT_MS = 15_000
export const SMTP_GREETING_TIMEOUT_MS = 15_000
export const SMTP_SOCKET_TIMEOUT_MS = 15_000

export const PG_CONNECTION_TIMEOUT_MS = 10_000

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const USER_APP_LANGUAGES = ["en", "hi"] as const
export type UserAppLanguage = (typeof USER_APP_LANGUAGES)[number]
