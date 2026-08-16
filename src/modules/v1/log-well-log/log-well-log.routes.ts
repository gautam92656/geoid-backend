import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as wellLogController from "./log-well-log.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(wellLogController.list))
router.post("/", asyncHandler(wellLogController.create))
router.get("/:id", asyncHandler(wellLogController.getOne))
router.patch("/:id", asyncHandler(wellLogController.update))
router.delete("/:id", asyncHandler(wellLogController.remove))
router.post("/:id/restore", asyncHandler(wellLogController.restore))
router.post("/:id/copy", asyncHandler(wellLogController.copy))

export default router
