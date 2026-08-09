export const LAB_TESTS_MODULE_SLUG = "lab-tests" as const
export const LAB_TEST_TYPES_DATA_TYPE_ID = "lab-test-types" as const

export type LabTestResultFieldDTO = {
  id: string
  name: string
  externalAlias?: string | null
  tablogsAlias?: string | null
}

export type LabTestTypeDTO = {
  id: string
  name: string
  graphic?: string | null
  externalAlias?: string | null
  aliasTable?: string | null
  addAsSelectedDataPlot?: boolean
  active?: boolean
  labTestResultFields?: LabTestResultFieldDTO[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "1" || normalized === "true" || normalized === "yes"
  }
  return fallback
}

function parseResultField(value: unknown, index: number): LabTestResultFieldDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name : ""
  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : `lab-result-field-${index + 1}`
  return {
    id,
    name,
    externalAlias:
      asNullableString(value.externalAlias) ?? asNullableString(value.external_alias),
    tablogsAlias:
      asNullableString(value.tablogsAlias) ?? asNullableString(value.tablogs_alias),
  }
}

export function parseLabTestResultFieldsDTO(value: unknown): LabTestResultFieldDTO[] {
  if (!Array.isArray(value)) return []
  const fields: LabTestResultFieldDTO[] = []
  for (const [index, entry] of value.entries()) {
    if (fields.length >= 30) break
    const parsed = parseResultField(entry, index)
    if (parsed) fields.push(parsed)
  }
  return fields
}

export function parseLabTestTypeDTO(value: unknown, index: number): LabTestTypeDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : typeof value.optionKey === "string" && value.optionKey.trim()
        ? value.optionKey.trim()
        : typeof value.id === "number"
          ? String(value.id)
          : `lab-test-type-${index + 1}`

  const resultFieldsRaw =
    value.labTestResultFields ??
    value.lab_test_result_fields ??
    value.resultFields ??
    value.result_fields

  return {
    id,
    name,
    graphic: asNullableString(value.graphic),
    externalAlias:
      asNullableString(value.externalAlias) ?? asNullableString(value.external_alias),
    aliasTable:
      asNullableString(value.aliasTable) ??
      asNullableString(value.alias_table) ??
      asNullableString(value.aliasTableName),
    addAsSelectedDataPlot:
      asBool(value.addAsSelectedDataPlot) || asBool(value.add_as_selected_data_plot),
    active: value.active === false ? false : true,
    labTestResultFields: parseLabTestResultFieldsDTO(resultFieldsRaw),
  }
}

export function parseLabTestTypeDTOList(value: unknown): LabTestTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: LabTestTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseLabTestTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function createLabTestsOptionKey(prefix: string, name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || prefix}-${Date.now().toString(36)}-${index}`
}
