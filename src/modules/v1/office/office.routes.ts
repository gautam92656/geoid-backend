import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as officeController from "./office.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(officeController.list))
router.post("/", asyncHandler(officeController.create))
router.get("/:id", asyncHandler(officeController.getOne))
router.patch("/:id", asyncHandler(officeController.update))
router.delete("/:id", asyncHandler(officeController.remove))

export default router
