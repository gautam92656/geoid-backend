import { Router, type Request, type Response } from "express"
import { successResponse } from "../shared/utils/apiResponse"
import v1Routes from "./v1.routes"

const router = Router()

router.get("/", (_req: Request, res: Response) => {
  successResponse(res, {
    service: "astra-backend",
    prefix: "/api/v1",
    swagger: "/api-docs/",
    health: "/health",
    examples: {
      signup: { method: "POST", path: "/api/v1/auth/signup" },
      login: { method: "POST", path: "/api/v1/auth/login" },
      forgotPassword: { method: "POST", path: "/api/v1/auth/forgot-password" },
      resetPassword: { method: "POST", path: "/api/v1/auth/reset-password" },
      faqs: { method: "GET", path: "/api/v1/faqs" },
    },
  })
})

router.use("/v1", v1Routes)

export default router
