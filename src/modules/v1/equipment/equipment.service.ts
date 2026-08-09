import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as repo from "./equipment.repository"

function formatDate(value: Date | null): string {
  if (!value) return ""
  return value.toISOString().slice(0, 10)
}

function toDTO(item: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: item.id,
    equipmentTypeId: item.equipmentTypeId,
    equipmentType: item.equipmentType.name,
    equipmentNo: item.equipmentNo ?? "",
    equipmentName: item.equipmentName ?? "",
    suppliers: item.suppliers,
    mounting: item.mounting ?? "",
    driveWeight: item.driveWeight ?? "",
    drop: item.drop ?? "",
    manufacturer: item.manufacturer ?? "",
    model: item.model ?? "",
    energyTransferRatio: item.energyTransferRatio ?? "",
    hammerEfficiencyCorrection: item.hammerEfficiencyCorrection ?? "",
    netAreaRatio: item.netAreaRatio ?? "",
    tipArea: item.tipArea ?? "",
    frictionRatio: item.frictionRatio ?? "",
    porePressureTransducerLocation: item.porePressureTransducerLocation ?? "",
    frictionReducerType: item.frictionReducerType ?? "",
    frictionReducer: item.frictionReducer ?? "",
    calibratedBy: item.calibratedBy ?? "",
    dateOfCalibration: formatDate(item.dateOfCalibration),
    bucketWidth: item.bucketWidth ?? "",
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    deletedAt: item.deletedAt?.toISOString() ?? null,
  }
}

async function assertEquipmentTypeForUser(equipmentTypeId: number, userId: number) {
  const equipmentType = await repo.findEquipmentTypeForUser(equipmentTypeId, userId)
  if (!equipmentType) {
    throw new ValidationError("Invalid equipment type.")
  }
}

export async function list(filters: repo.EquipmentListFilters) {
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(id: number, userId: number) {
  const item = await repo.findByIdForUser(id, userId)
  if (!item || item.deletedAt) throw new NotFoundError("Equipment not found")
  return toDTO(item)
}

export async function create(userId: number, input: Omit<repo.CreateEquipmentInput, "userId">) {
  await assertEquipmentTypeForUser(input.equipmentTypeId, userId)
  const item = await repo.create({ ...input, userId })
  return toDTO(item)
}

export async function update(
  id: number,
  userId: number,
  input: repo.UpdateEquipmentInput
) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Equipment not found")

  if (input.equipmentTypeId !== undefined) {
    await assertEquipmentTypeForUser(input.equipmentTypeId, userId)
  }

  const updated = await repo.update(id, input)
  return toDTO(updated)
}

export async function remove(id: number, userId: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Equipment not found")
  await repo.softDelete(id)
  return { message: "Equipment removed" }
}
