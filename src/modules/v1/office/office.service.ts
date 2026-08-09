import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import * as repo from "./office.repository"

function toDTO(office: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: office.id,
    name: office.name,
    address: office.address ?? "",
    phone: office.phone ?? "",
    externalId: office.externalId ?? "",
    officeNumber: office.officeNumber ?? "",
    state: office.state ?? "",
    laboratory: office.laboratory ?? "",
    createdAt: office.createdAt.toISOString(),
    updatedAt: office.updatedAt.toISOString(),
    deletedAt: office.deletedAt?.toISOString() ?? null,
  }
}

export async function list(filters: repo.OfficeListFilters) {
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(userId: number, id: number) {
  const office = await repo.findByIdForUser(id, userId)
  if (!office || office.deletedAt) throw new NotFoundError("Office not found")
  return toDTO(office)
}

export async function create(userId: number, input: Omit<repo.CreateOfficeInput, "userId">) {
  const duplicateName = await repo.findByNameForUser(userId, input.name)
  if (duplicateName) {
    throw new ConflictError("An office with this name already exists.")
  }

  const office = await repo.create({ ...input, userId })
  return toDTO(office)
}

export async function update(userId: number, id: number, input: repo.UpdateOfficeInput) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Office not found")

  if (input.name !== undefined) {
    const duplicateName = await repo.findByNameForUser(userId, input.name, id)
    if (duplicateName) {
      throw new ConflictError("An office with this name already exists.")
    }
  }

  const updated = await repo.update(id, userId, input)
  return toDTO(updated)
}

export async function remove(userId: number, id: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Office not found")
  await repo.softDelete(id, userId)
  return { message: "Office removed" }
}
