import type { Request } from "express"

export type JwtUserContext = {
  sub: number
  email: string
}

export type AuthedRequest = Request & { user?: JwtUserContext }
