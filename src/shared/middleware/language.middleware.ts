import type { NextFunction, Request, Response } from "express"
import { USER_APP_LANGUAGES, type UserAppLanguage } from "../constants"

function isSupported(val: string | undefined | null): val is UserAppLanguage {
  return (USER_APP_LANGUAGES as readonly string[]).includes(val ?? "")
}

export async function setLanguage(req: Request, res: Response, next: NextFunction): Promise<void> {
  const headerLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0]?.split(";")[0]?.trim()
  if (isSupported(headerLang)) {
    res.locals.lang = headerLang
    next()
    return
  }

  const queryLang = typeof req.query.lang === "string" ? req.query.lang.trim() : undefined
  if (isSupported(queryLang)) {
    res.locals.lang = queryLang
    next()
    return
  }

  res.locals.lang = "en"
  next()
}
