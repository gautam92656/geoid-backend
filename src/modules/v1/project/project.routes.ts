import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as projectController from "./project.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(projectController.list))
router.post("/", asyncHandler(projectController.create))
router.get("/by-number/:projectNo", asyncHandler(projectController.getByProjectNo))
router.get("/:id", asyncHandler(projectController.getOne))
router.patch("/:id", asyncHandler(projectController.update))
router.post("/:id/archive", asyncHandler(projectController.archive))
router.delete("/:id", asyncHandler(projectController.remove))

export default router
