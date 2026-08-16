import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as wellCasingController from "./log-well-casing.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(wellCasingController.list))
router.post("/", asyncHandler(wellCasingController.create))
router.get("/:id", asyncHandler(wellCasingController.getOne))
router.patch("/:id", asyncHandler(wellCasingController.update))
router.delete("/:id", asyncHandler(wellCasingController.remove))
router.post("/:id/restore", asyncHandler(wellCasingController.restore))
router.post("/:id/copy", asyncHandler(wellCasingController.copy))

export default router
