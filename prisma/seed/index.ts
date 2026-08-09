import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../src/generated/prisma/client"
import { env } from "../../src/config/env"
import { seedClassificationGraphics } from "./classificationGraphics"
import { seedClients } from "./clients"
import { seedOriginTypes } from "./originTypes"
import { seedEquipmentFieldDefinitions, seedEquipmentTypesForSeedUser } from "./equipmentTypes"
import { seedFaqs } from "./faqs"
import { seedLogConfigurationTemplates } from "./logConfigurationTemplates"
import { seedConfigModules } from "./configModules"
import { seedWorkflowTemplates } from "./workflowTemplates"
import { seedOriginOptionTemplates } from "./originOptionTemplates"
import { seedDataTypeOptionTemplates } from "./dataTypeOptionTemplates"
import { seedInsituTestTypeTemplates } from "./insituTestTypeTemplates"
import { seedInsituUnitSettingTemplates } from "./insituUnitSettingTemplates"
import { seedCoreDefectTypeTemplates } from "./coreDefectTypeTemplates"
import { seedApertureColorTemplates } from "./apertureColorTemplates"
import { seedApertureMineralTemplates } from "./apertureMineralTemplates"
import { seedInfillMaterialTemplates } from "./infillMaterialTemplates"
import { seedRemarkTypeTemplates } from "./remarkTypeTemplates"
import { seedRemarksQuickNoteTemplates } from "./remarksQuickNoteTemplates"
import { seedDrillingTypeTemplates } from "./drillingTypeTemplates"
import { seedDrillingResistanceTemplates } from "./drillingResistanceTemplates"
import { seedDrillingObservationTemplates } from "./drillingObservationTemplates"
import { seedDrillingCasingTemplates } from "./drillingCasingTemplates"
import { seedWaterObservationTypeTemplates } from "./waterObservationTypeTemplates"
import { seedWellTypeTemplates } from "./wellTypeTemplates"
import { seedWellCasingTypeTemplates } from "./wellCasingTypeTemplates"
import { seedWellCasingTopTemplates } from "./wellCasingTopTemplates"
import { seedWellCoverTypeTemplates } from "./wellCoverTypeTemplates"
import { seedWellProbeTypeTemplates } from "./wellProbeTypeTemplates"
import { seedWellBackfillTypeTemplates } from "./wellBackfillTypeTemplates"
import { seedWellDefaultWellIdTemplates } from "./wellDefaultWellIdTemplates"
import { seedSampleTypeTemplates } from "./sampleTypeTemplates"
import { seedLabTestTypeTemplates } from "./labTestTypeTemplates"
import { seedLabTestPresetTemplates } from "./labTestPresetTemplates"
import { seedLogs } from "./logs"
import { seedProjects } from "./projects"
import { seedSuppliers } from "./suppliers"
import { seedUsers } from "./users"

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables")
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting seed...")
  await seedUsers(prisma)
  await seedClients(prisma)
  await seedSuppliers(prisma)
  await seedProjects(prisma)
  await seedEquipmentFieldDefinitions(prisma)
  await seedEquipmentTypesForSeedUser(prisma)
  await seedLogs(prisma)
  await seedFaqs(prisma)
  await seedClassificationGraphics(prisma)
  await seedOriginTypes(prisma)
  await seedLogConfigurationTemplates(prisma)
  await seedConfigModules(prisma)
  await seedWorkflowTemplates(prisma)
  await seedOriginOptionTemplates(prisma)
  await seedDataTypeOptionTemplates(prisma)
  await seedInsituTestTypeTemplates(prisma)
  await seedInsituUnitSettingTemplates(prisma)
  await seedCoreDefectTypeTemplates(prisma)
  await seedApertureColorTemplates(prisma)
  await seedApertureMineralTemplates(prisma)
  await seedInfillMaterialTemplates(prisma)
  await seedRemarkTypeTemplates(prisma)
  await seedRemarksQuickNoteTemplates(prisma)
  await seedDrillingTypeTemplates(prisma)
  await seedDrillingResistanceTemplates(prisma)
  await seedDrillingObservationTemplates(prisma)
  await seedDrillingCasingTemplates(prisma)
  await seedWaterObservationTypeTemplates(prisma)
  await seedWellTypeTemplates(prisma)
  await seedWellCasingTypeTemplates(prisma)
  await seedWellCasingTopTemplates(prisma)
  await seedWellCoverTypeTemplates(prisma)
  await seedWellProbeTypeTemplates(prisma)
  await seedWellBackfillTypeTemplates(prisma)
  await seedWellDefaultWellIdTemplates(prisma)
  await seedSampleTypeTemplates(prisma)
  await seedLabTestTypeTemplates(prisma)
  await seedLabTestPresetTemplates(prisma)
  console.log("Seed completed successfully")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
