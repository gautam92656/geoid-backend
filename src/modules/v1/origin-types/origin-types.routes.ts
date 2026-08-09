import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as originTypesController from "./origin-types.controller"

const router = Router()

router.use(requireAuth)
router.get("/", asyncHandler(originTypesController.list))

export default router
