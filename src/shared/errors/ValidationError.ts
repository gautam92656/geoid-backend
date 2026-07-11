import { ApiError } from "./ApiError"

export class ValidationError extends ApiError {
  constructor(message = "Validation failed") {
    super(400, message)
  }
}
