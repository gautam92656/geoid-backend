import { ApiError } from "./ApiError"

export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(409, message)
  }
}
