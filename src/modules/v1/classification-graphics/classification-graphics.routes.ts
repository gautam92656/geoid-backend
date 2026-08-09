import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as classificationGraphicsController from "./classification-graphics.controller"

const router = Router()

router.use(requireAuth)
router.get("/", asyncHandler(classificationGraphicsController.list))

export default router
