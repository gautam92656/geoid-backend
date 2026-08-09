import { Router } from "express"
import { asyncHandler } from "../../../shared/utils/helper"
import { requireAuth } from "../../../shared/middleware/auth.middleware"
import { requireSuperAdmin } from "../../../shared/middleware/superAdmin.middleware"
import * as adminUserController from "./admin-user.controller"
import * as adminLogConfigurationController from "./admin-log-configuration.controller"

const router = Router()

router.use(requireAuth, requireSuperAdmin)

router.get("/users", asyncHandler(adminUserController.list))
router.post("/users", asyncHandler(adminUserController.create))
router.get("/users/:id", asyncHandler(adminUserController.getOne))
router.patch("/users/:id", asyncHandler(adminUserController.update))
router.delete("/users/:id", asyncHandler(adminUserController.remove))

router.get(
  "/users/:userId/log-configurations",
  asyncHandler(adminLogConfigurationController.list)
)
router.post(
  "/users/:userId/log-configurations",
  asyncHandler(adminLogConfigurationController.create)
)
router.get(
  "/users/:userId/log-configurations/:id/field-options/:fieldGroup/:fieldKey",
  asyncHandler(adminLogConfigurationController.getFieldOptions)
)
router.put(
  "/users/:userId/log-configurations/:id/field-options/:fieldGroup/:fieldKey",
  asyncHandler(adminLogConfigurationController.replaceFieldOptions)
)
router.get(
  "/users/:userId/log-configurations/:id",
  asyncHandler(adminLogConfigurationController.getOne)
)
router.patch(
  "/users/:userId/log-configurations/:id",
  asyncHandler(adminLogConfigurationController.update)
)
router.delete(
  "/users/:userId/log-configurations/:id",
  asyncHandler(adminLogConfigurationController.remove)
)

export default router
