import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import * as clientController from "./client.controller"

const router = Router()

router.use(requireAuth)

router.get("/", asyncHandler(clientController.list))
router.post("/", asyncHandler(clientController.create))
router.get("/:id", asyncHandler(clientController.getOne))
router.patch("/:id", asyncHandler(clientController.update))
router.delete("/:id", asyncHandler(clientController.remove))

export default router
