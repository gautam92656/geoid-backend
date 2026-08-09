import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import {
  SUPPLIER_RELATIONSHIP_FROM_PRISMA,
  SUPPLIER_RELATIONSHIP_TO_PRISMA,
  type SupplierRelationshipLabel,
} from "../../../shared/constants"
import type { SupplierRelationship } from "../../../generated/prisma/client"
import * as repo from "./supplier.repository"

function toRelationshipLabel(value: SupplierRelationship | null): SupplierRelationshipLabel | null {
  if (!value) return null
  return SUPPLIER_RELATIONSHIP_FROM_PRISMA[value] ?? null
}

function toRelationshipPrisma(value?: string): SupplierRelationship | undefined {
  if (!value?.trim()) return undefined
  const label = value.trim() as SupplierRelationshipLabel
  const mapped = SUPPLIER_RELATIONSHIP_TO_PRISMA[label]
  return mapped as SupplierRelationship | undefined
}

function toDTO(supplier: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: supplier.id,
    businessName: supplier.businessName,
    supplierType: supplier.supplierType,
    supplierRelationship: toRelationshipLabel(supplier.supplierRelationship),
    supplierExternalId: supplier.supplierExternalId || null,
    labTestTypes: supplier.labTestTypes,
    firstName: supplier.firstName || null,
    lastName: supplier.lastName || null,
    address: supplier.address || null,
    email: supplier.email || null,
    phone: supplier.phone || null,
    abn: supplier.abn || null,
    status: supplier.status,
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString(),
    deletedAt: supplier.deletedAt?.toISOString() ?? null,
  }
}

export async function list(filters: repo.SupplierListFilters) {
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(userId: number, id: number) {
  const supplier = await repo.findByIdForUser(id, userId)
  if (!supplier || supplier.deletedAt) throw new NotFoundError("Supplier not found")
  return toDTO(supplier)
}

export async function create(userId: number, input: Omit<repo.CreateSupplierInput, "userId">) {
  const duplicateName = await repo.findByBusinessNameForUser(userId, input.businessName)
  if (duplicateName) {
    throw new ConflictError("A supplier with this business name already exists.")
  }

  if (input.email?.trim()) {
    const duplicateEmail = await repo.findByEmailForUser(userId, input.email)
    if (duplicateEmail) {
      throw new ConflictError("A supplier with this email already exists.")
    }
  }

  const supplier = await repo.create({
    ...input,
    userId,
    supplierRelationship: toRelationshipPrisma(input.supplierRelationship),
  })
  return toDTO(supplier)
}

export async function update(userId: number, id: number, input: repo.UpdateSupplierInput) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Supplier not found")

  if (input.businessName !== undefined) {
    const duplicateName = await repo.findByBusinessNameForUser(userId, input.businessName, id)
    if (duplicateName) {
      throw new ConflictError("A supplier with this business name already exists.")
    }
  }

  if (input.email !== undefined && input.email.trim()) {
    const duplicateEmail = await repo.findByEmailForUser(userId, input.email, id)
    if (duplicateEmail) {
      throw new ConflictError("A supplier with this email already exists.")
    }
  }

  const updated = await repo.update(id, userId, {
    ...input,
    supplierRelationship:
      input.supplierRelationship !== undefined
        ? toRelationshipPrisma(input.supplierRelationship)
        : undefined,
  })
  return toDTO(updated)
}

export async function remove(userId: number, id: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Supplier not found")
  await repo.softDelete(id, userId)
  return { message: "Supplier removed" }
}
