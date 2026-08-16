import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as methodController from "./log-drilling-method.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(methodController.list))
router.post("/", asyncHandler(methodController.create))
router.get("/:id", asyncHandler(methodController.getOne))
router.patch("/:id", asyncHandler(methodController.update))
router.delete("/:id", asyncHandler(methodController.remove))
router.post("/:id/restore", asyncHandler(methodController.restore))
router.post("/:id/copy", asyncHandler(methodController.copy))

export default router
