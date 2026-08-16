import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as labTestController from "./log-lab-test.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(labTestController.list))
router.get("/type-groups", asyncHandler(labTestController.listTypeGroups))
router.post("/", asyncHandler(labTestController.create))
router.get("/:id", asyncHandler(labTestController.getOne))
router.patch("/:id", asyncHandler(labTestController.update))
router.delete("/:id", asyncHandler(labTestController.remove))
router.post("/:id/restore", asyncHandler(labTestController.restore))
router.post("/:id/copy", asyncHandler(labTestController.copy))

export default router
