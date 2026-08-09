import { Router } from "express"
import adminRoutes from "../modules/v1/admin/admin.routes"
import authRoutes from "../modules/v1/user/auth/auth.routes"
import classificationGraphicsRoutes from "../modules/v1/classification-graphics/classification-graphics.routes"
import insituTestTypeGraphicsRoutes from "../modules/v1/insitu-test-type-graphics/insitu-test-type-graphics.routes"
import drillingGraphicsRoutes from "../modules/v1/drilling-graphics/drilling-graphics.routes"
import drillingObservationGraphicsRoutes from "../modules/v1/drilling-observation-graphics/drilling-observation-graphics.routes"
import casingTypeGraphicsRoutes from "../modules/v1/casing-type-graphics/casing-type-graphics.routes"
import waterObsGraphicsRoutes from "../modules/v1/water-obs-graphics/water-obs-graphics.routes"
import chartGraphicsRoutes from "../modules/v1/chart-graphics/chart-graphics.routes"
import wellTypeGraphicsRoutes from "../modules/v1/well-type-graphics/well-type-graphics.routes"
import wellCoverGraphicsRoutes from "../modules/v1/well-cover-graphics/well-cover-graphics.routes"
import wellCasingGraphicsRoutes from "../modules/v1/well-casing-graphics/well-casing-graphics.routes"
import wellBackfillGraphicsRoutes from "../modules/v1/well-backfill-graphics/well-backfill-graphics.routes"
import wellProbeGraphicsRoutes from "../modules/v1/well-probe-graphics/well-probe-graphics.routes"
import clientRoutes from "../modules/v1/client/client.routes"
import originTypesRoutes from "../modules/v1/origin-types/origin-types.routes"
import equipmentRoutes from "../modules/v1/equipment/equipment.routes"
import equipmentTypeRoutes from "../modules/v1/equipment-type/equipment-type.routes"
import faqRoutes from "../modules/v1/faq/faq.routes"
import logRoutes from "../modules/v1/log/log.routes"
import logSubsurfaceLayerRoutes from "../modules/v1/log-subsurface-layer/log-subsurface-layer.routes"
import logInsituTestRoutes from "../modules/v1/log-insitu-test/log-insitu-test.routes"
import logRemarkRoutes from "../modules/v1/log-remark/log-remark.routes"
import logConfigurationRoutes from "../modules/v1/log-configuration/log-configuration.routes"
import logConfigurationTemplateRoutes from "../modules/v1/log-configuration-template/log-configuration-template.routes"
import configModuleRoutes from "../modules/v1/config-module/config-module.routes"
import headerFooterTemplateRoutes from "../modules/v1/header-footer-template/header-footer-template.routes"
import logReportTemplateRoutes from "../modules/v1/log-report-template/log-report-template.routes"
import officeRoutes from "../modules/v1/office/office.routes"
import projectRoutes from "../modules/v1/project/project.routes"
import projectStatusHistoryRoutes from "../modules/v1/project/project-status-history.routes"
import supplierRoutes from "../modules/v1/supplier/supplier.routes"
import { setLanguage } from "../shared/middleware/language.middleware"

const router = Router()

router.use("/admin", setLanguage, adminRoutes)
router.use("/auth", setLanguage, authRoutes)
router.use("/classification-graphics", setLanguage, classificationGraphicsRoutes)
router.use("/insitu-test-type-graphics", setLanguage, insituTestTypeGraphicsRoutes)
router.use("/drilling-graphics", setLanguage, drillingGraphicsRoutes)
router.use("/drilling-observation-graphics", setLanguage, drillingObservationGraphicsRoutes)
router.use("/casing-type-graphics", setLanguage, casingTypeGraphicsRoutes)
router.use("/water-obs-graphics", setLanguage, waterObsGraphicsRoutes)
router.use("/chart-graphics", setLanguage, chartGraphicsRoutes)
router.use("/well-type-graphics", setLanguage, wellTypeGraphicsRoutes)
router.use("/well-cover-graphics", setLanguage, wellCoverGraphicsRoutes)
router.use("/well-casing-graphics", setLanguage, wellCasingGraphicsRoutes)
router.use("/well-backfill-graphics", setLanguage, wellBackfillGraphicsRoutes)
router.use("/well-probe-graphics", setLanguage, wellProbeGraphicsRoutes)
router.use("/clients", setLanguage, clientRoutes)
router.use("/origin-types", setLanguage, originTypesRoutes)
router.use("/equipment", setLanguage, equipmentRoutes)
router.use("/equipment-types", setLanguage, equipmentTypeRoutes)
router.use("/faqs", setLanguage, faqRoutes)
router.use("/log-configurations", setLanguage, logConfigurationRoutes)
router.use("/log-configuration-templates", setLanguage, logConfigurationTemplateRoutes)
router.use("/config-modules", setLanguage, configModuleRoutes)
router.use("/header-footer-templates", setLanguage, headerFooterTemplateRoutes)
router.use("/log-report-templates", setLanguage, logReportTemplateRoutes)
router.use("/offices", setLanguage, officeRoutes)
router.use("/projects/:projectId/logs/:logId/subsurfaces", setLanguage, logSubsurfaceLayerRoutes)
router.use("/projects/:projectId/logs/:logId/insitu-tests", setLanguage, logInsituTestRoutes)
router.use("/projects/:projectId/logs/:logId/remarks", setLanguage, logRemarkRoutes)
router.use("/projects/:projectId/logs", setLanguage, logRoutes)
router.use("/projects/:projectId/status-history", setLanguage, projectStatusHistoryRoutes)
router.use("/projects", setLanguage, projectRoutes)
router.use("/suppliers", setLanguage, supplierRoutes)

export default router
