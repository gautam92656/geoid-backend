import { ApiError } from "./ApiError"
import { HTTP_STATUS } from "../constants"

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(HTTP_STATUS.FORBIDDEN, message)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}
