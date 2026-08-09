import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as logConfigurationController from "./log-configuration.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(logConfigurationController.list))
router.post("/", asyncHandler(logConfigurationController.create))
router.get("/:id/field-options/:fieldGroup/:fieldKey", asyncHandler(logConfigurationController.getFieldOptions))
router.put("/:id/field-options/:fieldGroup/:fieldKey", asyncHandler(logConfigurationController.replaceFieldOptions))
router.get("/:id", asyncHandler(logConfigurationController.getOne))
router.patch("/:id", asyncHandler(logConfigurationController.update))
router.delete("/:id", asyncHandler(logConfigurationController.remove))

export default router
