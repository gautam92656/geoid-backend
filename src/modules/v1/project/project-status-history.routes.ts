import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as statusHistoryController from "./project-status-history.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(statusHistoryController.list))
router.post("/", asyncHandler(statusHistoryController.create))

export default router
