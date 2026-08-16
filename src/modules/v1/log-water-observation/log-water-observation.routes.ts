import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as observationController from "./log-water-observation.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(observationController.list))
router.post("/", asyncHandler(observationController.create))
router.get("/:id", asyncHandler(observationController.getOne))
router.patch("/:id", asyncHandler(observationController.update))
router.delete("/:id", asyncHandler(observationController.remove))
router.post("/:id/restore", asyncHandler(observationController.restore))
router.post("/:id/copy", asyncHandler(observationController.copy))

export default router
