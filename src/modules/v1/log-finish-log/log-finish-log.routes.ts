import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as finishLogController from "./log-finish-log.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(finishLogController.list))
router.post("/", asyncHandler(finishLogController.create))
router.get("/:id", asyncHandler(finishLogController.getOne))
router.patch("/:id", asyncHandler(finishLogController.update))
router.delete("/:id", asyncHandler(finishLogController.remove))
router.post("/:id/restore", asyncHandler(finishLogController.restore))
router.post("/:id/copy", asyncHandler(finishLogController.copy))

export default router
