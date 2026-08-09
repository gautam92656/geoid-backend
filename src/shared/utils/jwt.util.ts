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
  const payload = jwt.verify(token, env.JWT_SECRET!) as jwt.JwtPayload & {
    sub?: unknown
    email?: unknown
  }

  const sub = typeof payload.sub === "number" ? payload.sub : Number.parseInt(String(payload.sub ?? ""), 10)
  const email = typeof payload.email === "string" ? payload.email : ""

  if (!Number.isInteger(sub) || sub < 1 || !email) {
    throw new Error("Invalid token payload")
  }

  return { sub, email }
}
