import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as layerController from "./log-subsurface-layer.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(layerController.list))
router.post("/", asyncHandler(layerController.create))
router.get("/:id", asyncHandler(layerController.getOne))
router.patch("/:id", asyncHandler(layerController.update))
router.delete("/:id", asyncHandler(layerController.remove))
router.post("/:id/restore", asyncHandler(layerController.restore))
router.post("/:id/copy", asyncHandler(layerController.copy))

export default router
