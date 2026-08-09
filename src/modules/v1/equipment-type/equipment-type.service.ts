import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  createDefaultEquipmentFieldConfig,
  createEmptyEquipmentFieldConfig,
  DEFAULT_EQUIPMENT_TYPES,
  EQUIPMENT_FIELD_DEFINITIONS,
  type EquipmentFieldKey,
} from "../../../shared/constants/equipmentType"
import * as repo from "./equipment-type.repository"

function normalizeFieldConfig(
  input: repo.EquipmentFieldConfig | undefined,
  existing?: repo.EquipmentFieldConfig
): repo.EquipmentFieldConfig {
  const base = existing ?? createEmptyEquipmentFieldConfig()
  if (!input) return base

  const next = { ...base }
  for (const { key } of EQUIPMENT_FIELD_DEFINITIONS) {
    if (key in input) {
      next[key] = Boolean(input[key])
    }
  }
  return next
}

function toDTO(type: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: type.id,
    name: type.name,
    description: type.description,
    status: type.status,
    isDefault: type.isDefault,
    fieldConfig: normalizeFieldConfig(type.fieldConfig as repo.EquipmentFieldConfig),
    createdAt: type.createdAt.toISOString(),
    updatedAt: type.updatedAt.toISOString(),
    deletedAt: type.deletedAt?.toISOString() ?? null,
  }
}

function toFieldDefinitionDTO(
  field: Awaited<ReturnType<typeof repo.listFieldDefinitions>>[number]
) {
  return {
    key: field.key,
    label: field.label,
    sortOrder: field.sortOrder,
  }
}

export async function ensureDefaultTypesForUser(userId: number) {
  const count = await repo.countForUser(userId)
  if (count > 0) return

  await repo.createManyForUser(
    userId,
    DEFAULT_EQUIPMENT_TYPES.map((type) => ({
      name: type.name,
      isDefault: true,
      fieldConfig: type.fieldConfig,
    }))
  )
}

export async function listFieldDefinitions() {
  const fields = await repo.listFieldDefinitions()
  if (fields.length === 0) {
    return EQUIPMENT_FIELD_DEFINITIONS.map((field) => ({
      key: field.key,
      label: field.label,
      sortOrder: field.sortOrder,
    }))
  }
  return fields.map(toFieldDefinitionDTO)
}

export async function list(filters: repo.EquipmentTypeListFilters) {
  await ensureDefaultTypesForUser(filters.userId)
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(id: number, userId: number) {
  const type = await repo.findByIdForUser(id, userId)
  if (!type || type.deletedAt) throw new NotFoundError("Equipment type not found")
  return toDTO(type)
}

export async function create(userId: number, input: Omit<repo.CreateEquipmentTypeInput, "userId">) {
  const duplicate = await repo.findByNameForUser(userId, input.name)
  if (duplicate) throw new ConflictError("An equipment type with this name already exists.")

  const type = await repo.create({
    userId,
    name: input.name,
    description: input.description,
    status: input.status,
    fieldConfig: normalizeFieldConfig(input.fieldConfig, createDefaultEquipmentFieldConfig()),
  })
  return toDTO(type)
}

export async function update(
  id: number,
  userId: number,
  input: repo.UpdateEquipmentTypeInput
) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Equipment type not found")

  if (input.name !== undefined && !existing.isDefault) {
    const duplicate = await repo.findByNameForUser(userId, input.name, id)
    if (duplicate) throw new ConflictError("An equipment type with this name already exists.")
  }

  const payload: repo.UpdateEquipmentTypeInput = {}
  if (input.description !== undefined) payload.description = input.description
  if (input.status !== undefined) payload.status = input.status
  if (input.fieldConfig !== undefined) {
    payload.fieldConfig = normalizeFieldConfig(
      input.fieldConfig,
      existing.fieldConfig as repo.EquipmentFieldConfig
    )
  }
  if (input.name !== undefined && !existing.isDefault) {
    payload.name = input.name
  }

  const updated = await repo.update(id, payload)
  return toDTO(updated)
}

export async function remove(id: number, userId: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Equipment type not found")
  if (existing.isDefault) {
    throw new ValidationError("Default equipment types cannot be deleted.")
  }

  await repo.softDelete(id)
  return { message: "Equipment type removed" }
}

export function getDefaultFieldConfigForNewType(): repo.EquipmentFieldConfig {
  return createDefaultEquipmentFieldConfig()
}

export type { EquipmentFieldKey }
