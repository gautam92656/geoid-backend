import { prisma } from "../../../infrastructure/database/prisma"
import type { LogConfigurationFieldGroup } from "../../../shared/constants/logConfigurationFieldOptions"

export type FieldOptionRow = {
  name: string
  sortOrder: number
}

function normalizeOptionNames(names: string[]): string[] {
  const seen = new Set<string>()
  const normalized: string[] = []

  for (const value of names) {
    const trimmed = value.trim()
    if (!trimmed) continue
    const dedupeKey = trimmed.toLowerCase()
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    normalized.push(trimmed)
  }

  return normalized
}

export async function listOptionsForField(
  logConfigurationId: number,
  fieldGroup: LogConfigurationFieldGroup,
  fieldKey: string
): Promise<string[]> {
  const rows = await prisma.logConfigurationFieldOption.findMany({
    where: {
      logConfigurationId,
      fieldGroup,
      fieldKey,
      deletedAt: null,
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { name: true },
  })

  return rows.map((row) => row.name)
}

export async function listGroupedOptionsForConfiguration(
  logConfigurationId: number
): Promise<Record<LogConfigurationFieldGroup, Record<string, string[]>>> {
  const rows = await prisma.logConfigurationFieldOption.findMany({
    where: {
      logConfigurationId,
      deletedAt: null,
    },
    orderBy: [{ fieldGroup: "asc" }, { fieldKey: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
    select: {
      fieldGroup: true,
      fieldKey: true,
      name: true,
    },
  })

  const grouped: Record<LogConfigurationFieldGroup, Record<string, string[]>> = {
    project_detail: {},
    log_detail: {},
  }

  for (const row of rows) {
    const group = row.fieldGroup as LogConfigurationFieldGroup
    if (!grouped[group][row.fieldKey]) {
      grouped[group][row.fieldKey] = []
    }
    grouped[group][row.fieldKey].push(row.name)
  }

  return grouped
}

export async function replaceOptionsForField(
  logConfigurationId: number,
  fieldGroup: LogConfigurationFieldGroup,
  fieldKey: string,
  names: string[]
): Promise<string[]> {
  const normalized = normalizeOptionNames(names)
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.logConfigurationFieldOption.updateMany({
      where: {
        logConfigurationId,
        fieldGroup,
        fieldKey,
        deletedAt: null,
      },
      data: { deletedAt: now },
    })

    if (normalized.length === 0) return

    await tx.logConfigurationFieldOption.createMany({
      data: normalized.map((name, index) => ({
        logConfigurationId,
        fieldGroup,
        fieldKey,
        name,
        sortOrder: index,
      })),
    })
  })

  return normalized
}

export async function seedDefaultOptionsForField(
  logConfigurationId: number,
  fieldGroup: LogConfigurationFieldGroup,
  fieldKey: string,
  defaultNames: string[]
): Promise<void> {
  const existing = await prisma.logConfigurationFieldOption.count({
    where: {
      logConfigurationId,
      fieldGroup,
      fieldKey,
      deletedAt: null,
    },
  })

  if (existing > 0) return

  await prisma.logConfigurationFieldOption.createMany({
    data: defaultNames.map((name, index) => ({
      logConfigurationId,
      fieldGroup,
      fieldKey,
      name,
      sortOrder: index,
    })),
  })
}

export async function ensureDefaultOptionsForConfiguration(
  logConfigurationId: number,
  defaults: {
    projectDetail: Record<string, string[]>
    logDetail: Record<string, string[]>
  }
): Promise<void> {
  await Promise.all([
    ...Object.entries(defaults.projectDetail).map(([fieldKey, names]) =>
      seedDefaultOptionsForField(logConfigurationId, "project_detail", fieldKey, names)
    ),
    ...Object.entries(defaults.logDetail).map(([fieldKey, names]) =>
      seedDefaultOptionsForField(logConfigurationId, "log_detail", fieldKey, names)
    ),
  ])
}
