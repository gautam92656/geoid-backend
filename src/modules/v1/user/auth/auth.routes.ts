import { Router } from "express"
import { asyncHandler } from "../../../../shared/utils/helper"
import * as authController from "./auth.controller"
import { requireAuth } from "../../../../shared/middleware/auth.middleware"

const router = Router()

router.post("/signup", asyncHandler(authController.signUp))
router.post("/login", asyncHandler(authController.login))
router.post("/verify-otp", asyncHandler(authController.verifyOtp))
router.post("/resend-otp", asyncHandler(authController.resendOtp))
router.post("/forgot-password", asyncHandler(authController.forgotPassword))
router.post("/reset-password", asyncHandler(authController.resetPassword))
router.post("/change-password", requireAuth, asyncHandler(authController.changePassword))

export default router
