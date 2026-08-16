import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as casingController from "./log-drilling-casing.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(casingController.list))
router.post("/", asyncHandler(casingController.create))
router.get("/:id", asyncHandler(casingController.getOne))
router.patch("/:id", asyncHandler(casingController.update))
router.delete("/:id", asyncHandler(casingController.remove))
router.post("/:id/restore", asyncHandler(casingController.restore))
router.post("/:id/copy", asyncHandler(casingController.copy))

export default router
