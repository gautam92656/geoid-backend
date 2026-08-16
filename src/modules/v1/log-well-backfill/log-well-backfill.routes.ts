import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as wellBackfillController from "./log-well-backfill.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(wellBackfillController.list))
router.post("/", asyncHandler(wellBackfillController.create))
router.get("/:id", asyncHandler(wellBackfillController.getOne))
router.patch("/:id", asyncHandler(wellBackfillController.update))
router.delete("/:id", asyncHandler(wellBackfillController.remove))
router.post("/:id/restore", asyncHandler(wellBackfillController.restore))
router.post("/:id/copy", asyncHandler(wellBackfillController.copy))

export default router
