import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as controller from "./insitu-test-type-graphics.controller"

const router = Router()

router.get("/files/:kind/:filename", asyncHandler(controller.serveFile))
router.use(requireAuth)
router.get("/", asyncHandler(controller.list))

export default router
