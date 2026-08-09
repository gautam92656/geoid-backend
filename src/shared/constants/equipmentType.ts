export const EQUIPMENT_FIELD_DEFINITIONS = [
  { key: "equipmentNo", label: "Equipment No", sortOrder: 1 },
  { key: "equipmentName", label: "Equipment Name", sortOrder: 2 },
  { key: "suppliers", label: "Suppliers", sortOrder: 3 },
  { key: "mounting", label: "Mounting", sortOrder: 4 },
  { key: "driveWeight", label: "Drive Weight", sortOrder: 5 },
  { key: "drop", label: "Drop", sortOrder: 6 },
  { key: "manufacturer", label: "Equipment Manufacturer", sortOrder: 7 },
  { key: "model", label: "Equipment Model", sortOrder: 8 },
  { key: "energyTransferRatio", label: "Energy Transfer Ratio", sortOrder: 9 },
  { key: "hammerEfficiencyCorrection", label: "Hammer Efficiency Corr…", sortOrder: 10 },
  { key: "netAreaRatio", label: "Net Area Ratio", sortOrder: 11 },
  { key: "tipArea", label: "Tip Area", sortOrder: 12 },
  { key: "porePressureTransducerLocation", label: "Pore Pressure Transduc…", sortOrder: 13 },
  { key: "frictionReducerType", label: "Friction Reducer Type", sortOrder: 14 },
  { key: "frictionReducer", label: "Friction Reducer", sortOrder: 15 },
  { key: "frictionRatio", label: "Friction Ratio", sortOrder: 16 },
  { key: "calibratedBy", label: "Calibrated By", sortOrder: 17 },
  { key: "dateOfCalibration", label: "Date Of Calibration", sortOrder: 18 },
  { key: "bucketWidth", label: "Bucket Width", sortOrder: 19 },
] as const

export type EquipmentFieldKey = (typeof EQUIPMENT_FIELD_DEFINITIONS)[number]["key"]

export const DRILL_RIG_FIELD_CONFIG: Record<EquipmentFieldKey, boolean> = {
  equipmentNo: true,
  equipmentName: false,
  suppliers: false,
  mounting: true,
  driveWeight: true,
  drop: true,
  manufacturer: true,
  model: true,
  energyTransferRatio: true,
  hammerEfficiencyCorrection: true,
  netAreaRatio: true,
  tipArea: true,
  frictionRatio: true,
  porePressureTransducerLocation: true,
  frictionReducerType: true,
  frictionReducer: true,
  calibratedBy: true,
  dateOfCalibration: true,
  bucketWidth: true,
}

export const EXCAVATOR_FIELD_CONFIG: Record<EquipmentFieldKey, boolean> = {
  equipmentNo: true,
  equipmentName: true,
  suppliers: true,
  mounting: true,
  driveWeight: false,
  drop: false,
  manufacturer: true,
  model: true,
  energyTransferRatio: false,
  hammerEfficiencyCorrection: false,
  netAreaRatio: false,
  tipArea: false,
  frictionRatio: false,
  porePressureTransducerLocation: false,
  frictionReducerType: false,
  frictionReducer: false,
  calibratedBy: false,
  dateOfCalibration: false,
  bucketWidth: true,
}

export const CPT_FIELD_CONFIG: Record<EquipmentFieldKey, boolean> = {
  equipmentNo: true,
  equipmentName: false,
  suppliers: false,
  mounting: true,
  driveWeight: false,
  drop: false,
  manufacturer: true,
  model: true,
  energyTransferRatio: false,
  hammerEfficiencyCorrection: false,
  netAreaRatio: true,
  tipArea: true,
  frictionRatio: true,
  porePressureTransducerLocation: true,
  frictionReducerType: true,
  frictionReducer: true,
  calibratedBy: true,
  dateOfCalibration: true,
  bucketWidth: false,
}

export const DEFAULT_EQUIPMENT_TYPES = [
  { name: "Drill Rig", fieldConfig: DRILL_RIG_FIELD_CONFIG },
  { name: "Excavator", fieldConfig: EXCAVATOR_FIELD_CONFIG },
  { name: "CPT", fieldConfig: CPT_FIELD_CONFIG },
] as const

export function createEmptyEquipmentFieldConfig(): Record<EquipmentFieldKey, boolean> {
  return Object.fromEntries(
    EQUIPMENT_FIELD_DEFINITIONS.map(({ key }) => [key, false])
  ) as Record<EquipmentFieldKey, boolean>
}

export function createDefaultEquipmentFieldConfig(): Record<EquipmentFieldKey, boolean> {
  return { ...DRILL_RIG_FIELD_CONFIG }
}
