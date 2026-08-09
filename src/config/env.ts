import path from "path"
import dotenv from "dotenv"

const nodeEnv = process.env.NODE_ENV || "development"
dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) })

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 1 && n <= 65_535 ? n : fallback
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parsePort(process.env.PORT, 3000),
  UPLOADS_DIR: process.env.UPLOADS_DIR || path.resolve(process.cwd(), "uploads"),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  SMTP_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  SMTP_PORT: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  SMTP_USER: process.env.EMAIL || "",
  SMTP_PASS: process.env.PASSWORD || "",
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY?.trim() ?? "",
  MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX?.trim() ?? "",
  MAILCHIMP_LIST_ID: process.env.MAILCHIMP_LIST_ID?.trim() ?? "",
  MAILCHIMP_TRANSACTIONAL_API_KEY: process.env.MAILCHIMP_TRANSACTIONAL_API_KEY?.trim() ?? "",
  MAILCHIMP_FROM_EMAIL: process.env.MAILCHIMP_FROM_EMAIL?.trim() ?? "",
  MAILCHIMP_FROM_NAME: process.env.MAILCHIMP_FROM_NAME?.trim() ?? "Astra",
}
