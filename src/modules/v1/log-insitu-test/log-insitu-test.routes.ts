import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as testController from "./log-insitu-test.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(testController.list))
router.post("/", asyncHandler(testController.create))
router.get("/:id", asyncHandler(testController.getOne))
router.patch("/:id", asyncHandler(testController.update))
router.delete("/:id", asyncHandler(testController.remove))
router.post("/:id/restore", asyncHandler(testController.restore))
router.post("/:id/copy", asyncHandler(testController.copy))

export default router
