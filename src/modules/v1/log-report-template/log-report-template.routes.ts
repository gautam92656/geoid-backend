import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as logReportTemplateController from "./log-report-template.controller"

const router = Router()

router.use(requireAuth)

// Static paths before /:id
router.get("/", asyncHandler(logReportTemplateController.list))
router.get("/builder-configuration", asyncHandler(logReportTemplateController.builderConfiguration))
router.post("/reorder", asyncHandler(logReportTemplateController.reorder))
router.post("/", asyncHandler(logReportTemplateController.create))
router.get("/:id", asyncHandler(logReportTemplateController.getOne))
router.patch("/:id", asyncHandler(logReportTemplateController.update))
router.delete("/:id", asyncHandler(logReportTemplateController.remove))

export default router
