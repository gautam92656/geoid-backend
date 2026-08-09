import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as controller from "./well-cover-graphics.controller"

const router = Router()

router.get("/files/:filename", asyncHandler(controller.serveFile))
router.use(requireAuth)
router.get("/", asyncHandler(controller.list))

export default router
