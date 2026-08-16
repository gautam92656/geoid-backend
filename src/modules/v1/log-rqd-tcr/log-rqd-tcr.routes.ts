import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as rqdTcrController from "./log-rqd-tcr.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(rqdTcrController.list))
router.post("/", asyncHandler(rqdTcrController.create))
router.get("/:id", asyncHandler(rqdTcrController.getOne))
router.patch("/:id", asyncHandler(rqdTcrController.update))
router.delete("/:id", asyncHandler(rqdTcrController.remove))
router.post("/:id/restore", asyncHandler(rqdTcrController.restore))
router.post("/:id/copy", asyncHandler(rqdTcrController.copy))

export default router
