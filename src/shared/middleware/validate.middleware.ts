import type { Request, Response, NextFunction } from "express"
import type Joi from "joi"
import { ValidationError } from "../errors/ValidationError"

export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false })
    if (error) {
      const message = error.details.map((d) => d.message).join("; ")
      next(new ValidationError(message))
      return
    }
    req.body = value
    next()
  }
}
