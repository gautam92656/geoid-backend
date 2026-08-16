import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as coreDefectController from "./log-core-defect.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(coreDefectController.list))
router.post("/", asyncHandler(coreDefectController.create))
router.get("/:id", asyncHandler(coreDefectController.getOne))
router.patch("/:id", asyncHandler(coreDefectController.update))
router.delete("/:id", asyncHandler(coreDefectController.remove))
router.post("/:id/restore", asyncHandler(coreDefectController.restore))
router.post("/:id/copy", asyncHandler(coreDefectController.copy))

export default router
