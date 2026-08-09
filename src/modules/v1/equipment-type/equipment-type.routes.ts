import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as equipmentTypeController from "./equipment-type.controller"

const router = Router()

router.use(requireAuth)

router.get("/fields", asyncHandler(equipmentTypeController.listFieldDefinitions))
router.get("/", asyncHandler(equipmentTypeController.list))
router.post("/", asyncHandler(equipmentTypeController.create))
router.get("/:id", asyncHandler(equipmentTypeController.getOne))
router.patch("/:id", asyncHandler(equipmentTypeController.update))
router.delete("/:id", asyncHandler(equipmentTypeController.remove))

export default router
