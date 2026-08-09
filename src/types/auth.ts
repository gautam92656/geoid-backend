import type { Request } from "express"

export type JwtUserContext = {
  sub: number
  email: string
  role: "user" | "super_admin"
}

export type AuthedRequest = Request & { user?: JwtUserContext }
