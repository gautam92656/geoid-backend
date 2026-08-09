import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as supplierController from "./supplier.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(supplierController.list))
router.post("/", asyncHandler(supplierController.create))
router.get("/:id", asyncHandler(supplierController.getOne))
router.patch("/:id", asyncHandler(supplierController.update))
router.delete("/:id", asyncHandler(supplierController.remove))

export default router
