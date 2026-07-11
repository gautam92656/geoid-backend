import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as faqController from "./faq.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(faqController.list))
router.post("/", asyncHandler(faqController.create))
router.get("/:id", asyncHandler(faqController.getOne))
router.patch("/:id", asyncHandler(faqController.update))
router.delete("/:id", asyncHandler(faqController.remove))

export default router
