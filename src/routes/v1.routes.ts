import { Router } from "express"
import authRoutes from "../modules/v1/user/auth/auth.routes"
import faqRoutes from "../modules/v1/faq/faq.routes"
import { setLanguage } from "../shared/middleware/language.middleware"

const router = Router()

router.use("/auth", setLanguage, authRoutes)
router.use("/faqs", setLanguage, faqRoutes)

export default router
