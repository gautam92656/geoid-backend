import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as logConfigurationTemplateController from "./log-configuration-template.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(logConfigurationTemplateController.list))
router.post("/", asyncHandler(logConfigurationTemplateController.create))
router.get("/:id", asyncHandler(logConfigurationTemplateController.getOne))
router.patch("/:id", asyncHandler(logConfigurationTemplateController.update))
router.delete("/:id", asyncHandler(logConfigurationTemplateController.remove))

export default router
