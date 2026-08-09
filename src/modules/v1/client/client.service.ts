import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import * as repo from "./client.repository"

function toDTO(client: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: client.id,
    companyName: client.companyName,
    companyContact: client.companyContact ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    externalId: client.externalId ?? "",
    status: client.status,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    deletedAt: client.deletedAt?.toISOString() ?? null,
  }
}

export async function list(filters: repo.ClientListFilters) {
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(userId: number, id: number) {
  const client = await repo.findByIdForUser(id, userId)
  if (!client || client.deletedAt) throw new NotFoundError("Client not found")
  return toDTO(client)
}

export async function create(userId: number, input: Omit<repo.CreateClientInput, "userId">) {
  const duplicateName = await repo.findByCompanyNameForUser(userId, input.companyName)
  if (duplicateName) {
    throw new ConflictError("A client with this company name already exists.")
  }

  if (input.email?.trim()) {
    const duplicateEmail = await repo.findByEmailForUser(userId, input.email)
    if (duplicateEmail) {
      throw new ConflictError("A client with this email already exists.")
    }
  }

  const client = await repo.create({ ...input, userId })
  return toDTO(client)
}

export async function update(userId: number, id: number, input: repo.UpdateClientInput) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Client not found")

  if (input.companyName !== undefined) {
    const duplicateName = await repo.findByCompanyNameForUser(userId, input.companyName, id)
    if (duplicateName) {
      throw new ConflictError("A client with this company name already exists.")
    }
  }

  if (input.email !== undefined && input.email.trim()) {
    const duplicateEmail = await repo.findByEmailForUser(userId, input.email, id)
    if (duplicateEmail) {
      throw new ConflictError("A client with this email already exists.")
    }
  }

  const updated = await repo.update(id, userId, input)
  return toDTO(updated)
}

export async function remove(userId: number, id: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Client not found")
  await repo.softDelete(id, userId)
  return { message: "Client removed" }
}
