import type { PrismaClient } from "../../src/generated/prisma/client"
import { getSeedUserId } from "./getSeedUser"
import { resetAutoIncrementSequence } from "./resetSequence"

const SUPPLIERS = [
  {
    id: 1,
    businessName: "GeoTest Laboratories",
    supplierType: "Laboratory" as const,
    supplierRelationship: "InternalSupplier" as const,
    supplierExternalId: "SUP-001",
    labTestTypes: ["Moisture Content", "Particle Size Distribution", "Atterberg Limits"],
    firstName: "David",
    lastName: "Walsh",
    address: "12 Industrial Ave, Melbourne VIC 3000",
    email: "david@geotest.com.au",
    phone: "+61 3 9123 4567",
    abn: "12 345 678 901",
    status: "active" as const,
  },
  {
    id: 2,
    businessName: "SiteTech Equipment Hire",
    supplierType: "Equipment" as const,
    supplierRelationship: "InternalSupplier" as const,
    supplierExternalId: "SUP-002",
    labTestTypes: [] as string[],
    firstName: "Rachel",
    lastName: "Kim",
    address: "45 Warehouse Rd, Dandenong VIC 3175",
    email: "rachel@sitetech.com.au",
    phone: "+61 3 9876 5432",
    abn: "98 765 432 109",
    status: "active" as const,
  },
  {
    id: 3,
    businessName: "Aussie Soil Labs",
    supplierType: "Laboratory" as const,
    supplierRelationship: "ExternalSupplier" as const,
    supplierExternalId: "SUP-003",
    labTestTypes: ["Moisture Content", "IS50"],
    firstName: "Tom",
    lastName: "Brennan",
    address: "8 Lab St, Brisbane QLD 4000",
    email: "tom@aussiesoil.com.au",
    phone: "+61 7 3456 7890",
    abn: "11 223 344 556",
    status: "active" as const,
  },
  {
    id: 4,
    businessName: "Metro Concrete Testing",
    supplierType: "Laboratory" as const,
    supplierRelationship: "ExternalSupplier" as const,
    supplierExternalId: "SUP-005",
    labTestTypes: ["UCS - Unconfined Compressive Strength", "q - Triaxial Test"],
    firstName: "Chris",
    lastName: "O'Brien",
    address: "3 Testing Ln, Perth WA 6000",
    email: "chris@metroconcrete.com.au",
    phone: "+61 8 9123 0000",
    abn: "44 556 677 889",
    status: "inactive" as const,
  },
]

export async function seedSuppliers(prisma: PrismaClient) {
  const userId = await getSeedUserId(prisma)

  for (const { id, ...data } of SUPPLIERS) {
    await prisma.supplier.upsert({
      where: { id },
      update: { ...data, userId },
      create: { id, ...data, userId },
    })
  }

  await resetAutoIncrementSequence(prisma, "suppliers")

  console.log(`Seeded ${SUPPLIERS.length} supplier(s)`)
}
