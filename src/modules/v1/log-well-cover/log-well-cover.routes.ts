import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as wellCoverController from "./log-well-cover.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(wellCoverController.list))
router.post("/", asyncHandler(wellCoverController.create))
router.get("/:id", asyncHandler(wellCoverController.getOne))
router.patch("/:id", asyncHandler(wellCoverController.update))
router.delete("/:id", asyncHandler(wellCoverController.remove))
router.post("/:id/restore", asyncHandler(wellCoverController.restore))
router.post("/:id/copy", asyncHandler(wellCoverController.copy))

export default router
