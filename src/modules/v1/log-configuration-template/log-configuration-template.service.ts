import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { DEFAULT_LOG_CONFIGURATION_TEMPLATES } from "../../../shared/constants/logConfigurationTemplate"
import * as repo from "./log-configuration-template.repository"

function toDTO(template: NonNullable<Awaited<ReturnType<typeof repo.findById>>>) {
  return {
    id: template.slug,
    slug: template.slug,
    name: template.name,
    description: template.description,
    region: template.region,
    disciplines: template.disciplines,
    available: template.isAvailable,
    sortOrder: template.sortOrder,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    deletedAt: template.deletedAt?.toISOString() ?? null,
  }
}

export async function syncDefaultTemplates() {
  for (const template of DEFAULT_LOG_CONFIGURATION_TEMPLATES) {
    await repo.upsertDefault({
      slug: template.slug,
      name: template.name,
      description: template.description,
      region: template.region,
      disciplines: [...template.disciplines],
      isAvailable: template.isAvailable,
      sortOrder: template.sortOrder,
    })
  }
}

export async function list(filters: repo.LogConfigurationTemplateListFilters) {
  await syncDefaultTemplates()
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(id: number) {
  const template = await repo.findById(id)
  if (!template || template.deletedAt) throw new NotFoundError("Log configuration template not found")
  return toDTO(template)
}

export async function create(input: repo.CreateLogConfigurationTemplateInput) {
  const duplicate = await repo.findBySlug(input.slug)
  if (duplicate && !duplicate.deletedAt) {
    throw new ConflictError("A log configuration template with this slug already exists.")
  }

  const template = await repo.create(input)
  return toDTO(template)
}

export async function update(id: number, input: repo.UpdateLogConfigurationTemplateInput) {
  const existing = await repo.findById(id)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Log configuration template not found")
  }

  if (input.slug !== undefined) {
    const duplicate = await repo.findBySlug(input.slug)
    if (duplicate && duplicate.id !== id && !duplicate.deletedAt) {
      throw new ConflictError("A log configuration template with this slug already exists.")
    }
  }

  const updated = await repo.update(id, input)
  return toDTO(updated)
}

export async function remove(id: number) {
  const existing = await repo.findById(id)
  if (!existing || existing.deletedAt) {
    throw new NotFoundError("Log configuration template not found")
  }
  await repo.softDelete(id)
  return { message: "Log configuration template removed" }
}
