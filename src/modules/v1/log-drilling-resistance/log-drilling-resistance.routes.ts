import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as resistanceController from "./log-drilling-resistance.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(resistanceController.list))
router.post("/", asyncHandler(resistanceController.create))
router.get("/:id", asyncHandler(resistanceController.getOne))
router.patch("/:id", asyncHandler(resistanceController.update))
router.delete("/:id", asyncHandler(resistanceController.remove))
router.post("/:id/restore", asyncHandler(resistanceController.restore))
router.post("/:id/copy", asyncHandler(resistanceController.copy))

export default router
