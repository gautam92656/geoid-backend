import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as remarkController from "./log-remark.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(remarkController.list))
router.post("/", asyncHandler(remarkController.create))
router.get("/:id", asyncHandler(remarkController.getOne))
router.patch("/:id", asyncHandler(remarkController.update))
router.delete("/:id", asyncHandler(remarkController.remove))
router.post("/:id/restore", asyncHandler(remarkController.restore))
router.post("/:id/copy", asyncHandler(remarkController.copy))

export default router
