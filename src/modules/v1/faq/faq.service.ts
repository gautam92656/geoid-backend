import { NotFoundError } from "../../../shared/errors/NotFoundError"
import * as repo from "./faq.repository"

function toDTO(f: NonNullable<Awaited<ReturnType<typeof repo.findById>>>) {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder,
    isActive: f.isActive,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
    deletedAt: f.deletedAt?.toISOString() ?? null,
  }
}

export async function list(filters: repo.FaqListFilters) {
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(id: number) {
  const faq = await repo.findById(id)
  if (!faq) throw new NotFoundError("FAQ not found")
  return toDTO(faq)
}

export async function create(input: repo.CreateFaqInput) {
  const faq = await repo.create(input)
  return toDTO(faq)
}

export async function update(id: number, input: repo.UpdateFaqInput) {
  const existing = await repo.findById(id)
  if (!existing) throw new NotFoundError("FAQ not found")
  if (existing.deletedAt) throw new NotFoundError("FAQ not found")
  const updated = await repo.update(id, input)
  return toDTO(updated)
}

export async function remove(id: number) {
  const existing = await repo.findById(id)
  if (!existing) throw new NotFoundError("FAQ not found")
  if (existing.deletedAt) throw new NotFoundError("FAQ not found")
  await repo.softDelete(id)
  return { message: "FAQ removed" }
}
