import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as headerFooterTemplateController from "./header-footer-template.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(headerFooterTemplateController.list))
router.post("/", asyncHandler(headerFooterTemplateController.create))
router.get("/:id", asyncHandler(headerFooterTemplateController.getOne))
router.patch("/:id", asyncHandler(headerFooterTemplateController.update))
router.delete("/:id", asyncHandler(headerFooterTemplateController.remove))

export default router
