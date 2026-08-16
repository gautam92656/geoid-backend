import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as sampleController from "./log-sample.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(sampleController.list))
router.post("/", asyncHandler(sampleController.create))
router.get("/:id", asyncHandler(sampleController.getOne))
router.patch("/:id", asyncHandler(sampleController.update))
router.delete("/:id", asyncHandler(sampleController.remove))
router.post("/:id/restore", asyncHandler(sampleController.restore))
router.post("/:id/copy", asyncHandler(sampleController.copy))

export default router
