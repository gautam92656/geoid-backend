import nodemailer from "nodemailer"
import { env } from "../../config/env"
import {
  OTP_EXPIRY_MINUTES,
  SMTP_CONNECTION_TIMEOUT_MS,
  SMTP_GREETING_TIMEOUT_MS,
  SMTP_SOCKET_TIMEOUT_MS,
} from "../constants"
import { otpEmailTemplate } from "../templates/otp-email.template"
import { sendMailViaMailchimp } from "./mailchimp.service"

export const _smtpTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
  greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
  socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

export async function sendOtpEmail(to: string, firstName: string, otpCode: string): Promise<void> {
  await sendMailViaMailchimp({
    to,
    subject: "Verify your email – Your OTP code",
    html: otpEmailTemplate(firstName, otpCode, OTP_EXPIRY_MINUTES),
  })
}
