import jwt from "jsonwebtoken"
import { env } from "../../config/env"

export interface TokenPayload {
  sub: number
  email: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET!, {
    expiresIn: (env.JWT_EXPIRES_IN ?? "1h") as jwt.SignOptions["expiresIn"],
  })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET!) as unknown as TokenPayload
}
