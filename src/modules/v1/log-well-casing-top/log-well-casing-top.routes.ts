import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as wellCasingTopController from "./log-well-casing-top.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(wellCasingTopController.list))
router.post("/", asyncHandler(wellCasingTopController.create))
router.get("/:id", asyncHandler(wellCasingTopController.getOne))
router.patch("/:id", asyncHandler(wellCasingTopController.update))
router.delete("/:id", asyncHandler(wellCasingTopController.remove))
router.post("/:id/restore", asyncHandler(wellCasingTopController.restore))
router.post("/:id/copy", asyncHandler(wellCasingTopController.copy))

export default router
