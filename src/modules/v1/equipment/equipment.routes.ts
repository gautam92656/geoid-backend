import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as equipmentController from "./equipment.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(equipmentController.list))
router.post("/", asyncHandler(equipmentController.create))
router.get("/:id", asyncHandler(equipmentController.getOne))
router.patch("/:id", asyncHandler(equipmentController.update))
router.delete("/:id", asyncHandler(equipmentController.remove))

export default router
