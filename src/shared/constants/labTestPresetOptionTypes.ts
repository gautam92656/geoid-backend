export const LAB_TEST_PRESETS_DATA_TYPE_ID = "lab-test-presets" as const

export type LabTestPresetDTO = {
  id: string
  name: string
  labTestTypeIds?: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function parseLabTestTypeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const ids: string[] = []
  const seen = new Set<string>()
  for (const entry of value) {
    if (typeof entry === "string") {
      const id = entry.trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      ids.push(id)
      continue
    }
    if (isRecord(entry)) {
      const id = asNullableString(entry.id) ?? asNullableString(entry.value)
      if (!id || seen.has(id)) continue
      seen.add(id)
      ids.push(id)
    }
  }
  return ids
}

export function parseLabTestPresetDTO(value: unknown, index: number): LabTestPresetDTO | null {
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
          : `lab-test-preset-${index + 1}`

  return {
    id,
    name,
    labTestTypeIds: parseLabTestTypeIds(
      value.labTestTypeIds ?? value.lab_test_type_ids ?? value.labTestTypes ?? value.lab_test_types
    ),
  }
}

export function parseLabTestPresetDTOList(value: unknown): LabTestPresetDTO[] {
  if (!Array.isArray(value)) return []
  const options: LabTestPresetDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseLabTestPresetDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}
