import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as wellProbeController from "./log-well-probe.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(wellProbeController.list))
router.post("/", asyncHandler(wellProbeController.create))
router.get("/:id", asyncHandler(wellProbeController.getOne))
router.patch("/:id", asyncHandler(wellProbeController.update))
router.delete("/:id", asyncHandler(wellProbeController.remove))
router.post("/:id/restore", asyncHandler(wellProbeController.restore))
router.post("/:id/copy", asyncHandler(wellProbeController.copy))

export default router
