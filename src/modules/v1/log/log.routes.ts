import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as logController from "./log.controller"

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get("/", asyncHandler(logController.list))
router.post("/", asyncHandler(logController.create))
router.get("/:id", asyncHandler(logController.getOne))
router.patch("/:id", asyncHandler(logController.update))
router.delete("/:id", asyncHandler(logController.remove))

export default router
