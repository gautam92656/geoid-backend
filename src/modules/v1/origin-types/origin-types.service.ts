import * as originTypesRepository from "./origin-types.repository"

export type OriginType = {
  id: number
  label: string
  value: string
  sort_order: number
}

export async function listOriginTypes(): Promise<OriginType[]> {
  const records = await originTypesRepository.findAllActive()
  return records.map((record) => ({
    id: record.id,
    label: record.label,
    value: record.value,
    sort_order: record.sortOrder,
  }))
}
