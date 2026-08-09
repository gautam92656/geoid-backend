import { prisma } from "../../../infrastructure/database/prisma"
import { Prisma } from "../../../generated/prisma/client"
import { getSkipTake } from "../../../shared/utils/pagination"
import type {
  ConfigModuleTag,
  ConfigModuleTagTone,
} from "../../../shared/constants/configModuleCatalog"
import { parseStoredModuleSettings } from "../../../shared/constants/configModuleSettings"
import type { StoredModuleSettings } from "../../../shared/constants/configModuleSettings"

export type ModuleScope = "common" | "user"

/** Unified row shape used by the service layer (common + user tables). */
export type ModuleRecord = {
  id: number
  slug: string
  title: string
  description: string
  tags: unknown
  filterCategories: string[]
  scope: ModuleScope
  sourceSlug: string | null
  settings: unknown
  userId: number | null
  /** Null for common (shared) modules; set for user customizations. */
  logConfigurationId: number | null
  isAvailable: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateCommonModuleInput = {
  slug: string
  title: string
  description: string
  tags: ConfigModuleTag[]
  filterCategories: string[]
  isAvailable?: boolean
  sortOrder?: number
}

export type CreateUserModuleInput = {
  logConfigurationId: number
  slug: string
  title: string
  description: string
  tags: ConfigModuleTag[]
  filterCategories: string[]
  sourceSlug?: string | null
  settings?: StoredModuleSettings | null
  isAvailable?: boolean
  sortOrder?: number
}

export type UpdateUserModuleInput = Partial<Omit<CreateUserModuleInput, "logConfigurationId">>

export type ConfigModuleListFilters = {
  page: number
  limit: number
  userId: number
  logConfigurationId?: number
  includeDeleted?: boolean
  availableOnly?: boolean
  search?: string
  scope?: ModuleScope
  category?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

function toJsonTags(tags: ConfigModuleTag[]): Prisma.InputJsonValue {
  return tags.map((tag) => ({ label: tag.label, tone: tag.tone }))
}

export function buildUserModuleSlug(
  userId: number,
  logConfigurationId: number,
  sourceSlug: string
): string {
  return `u${userId}-c${logConfigurationId}-${sourceSlug.trim()}`
}

export function parseStoredTags(value: unknown): ConfigModuleTag[] {
  if (!Array.isArray(value)) return []

  const tones = new Set<string>(["geotechnical", "category", "region"])
  const tags: ConfigModuleTag[] = []

  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue
    const record = entry as Record<string, unknown>
    const label = typeof record.label === "string" ? record.label.trim() : ""
    const tone = typeof record.tone === "string" ? record.tone : ""
    if (!label || !tones.has(tone)) continue
    tags.push({ label, tone: tone as ConfigModuleTagTone })
  }

  return tags
}

export function parseModuleSettingsField(
  value: unknown,
  templateId: string
): StoredModuleSettings | null {
  if (value == null) return null
  return parseStoredModuleSettings(value, templateId)
}

function mapCommon(
  row: Awaited<ReturnType<typeof prisma.configModule.findFirst>>
): ModuleRecord | null {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tags: row.tags,
    filterCategories: row.filterCategories,
    scope: "common",
    sourceSlug: null,
    settings: null,
    userId: null,
    logConfigurationId: null,
    isAvailable: row.isAvailable,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

function mapUser(
  row: Awaited<ReturnType<typeof prisma.userModule.findFirst>>
): ModuleRecord | null {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tags: row.tags,
    filterCategories: row.filterCategories,
    scope: "user",
    sourceSlug: row.sourceSlug,
    settings: row.settings,
    userId: row.userId,
    logConfigurationId: row.logConfigurationId,
    isAvailable: row.isAvailable,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

export async function upsertCommon(data: CreateCommonModuleInput) {
  const row = await prisma.configModule.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title.trim(),
      description: data.description.trim(),
      tags: toJsonTags(data.tags),
      filterCategories: data.filterCategories.map((entry) => entry.trim()).filter(Boolean),
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
      deletedAt: null,
    },
    create: {
      slug: data.slug.trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      tags: toJsonTags(data.tags),
      filterCategories: data.filterCategories.map((entry) => entry.trim()).filter(Boolean),
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  return mapCommon(row)!
}

export async function softDeleteCommonBySlugs(slugs: readonly string[]) {
  if (slugs.length === 0) return { count: 0 }

  return prisma.configModule.updateMany({
    where: {
      slug: { in: [...slugs] },
      deletedAt: null,
    },
    data: {
      isAvailable: false,
      deletedAt: new Date(),
    },
  })
}

export async function findCommonBySlug(slug: string): Promise<ModuleRecord | null> {
  return mapCommon(
    await prisma.configModule.findFirst({
      where: { slug: slug.trim() },
    })
  )
}

/** @deprecated Prefer findCommonBySlug — kept as alias for template lookups. */
export async function findBySlug(slug: string): Promise<ModuleRecord | null> {
  return findCommonBySlug(slug)
}

export async function findUserModuleBySourceSlug(
  userId: number,
  logConfigurationId: number,
  sourceSlug: string,
  options: { includeDeleted?: boolean } = {}
): Promise<ModuleRecord | null> {
  return mapUser(
    await prisma.userModule.findFirst({
      where: {
        userId,
        logConfigurationId,
        sourceSlug: sourceSlug.trim(),
        ...(options.includeDeleted ? {} : { deletedAt: null }),
      },
    })
  )
}

export async function findUserModuleBySlug(
  userId: number,
  logConfigurationId: number,
  slug: string
): Promise<ModuleRecord | null> {
  return mapUser(
    await prisma.userModule.findFirst({
      where: {
        userId,
        logConfigurationId,
        slug: slug.trim(),
        deletedAt: null,
      },
    })
  )
}

function matchesSearch(row: ModuleRecord, search: string): boolean {
  const q = search.toLowerCase()
  return (
    row.title.toLowerCase().includes(q) ||
    row.description.toLowerCase().includes(q) ||
    row.slug.toLowerCase().includes(q) ||
    (row.sourceSlug?.toLowerCase().includes(q) ?? false)
  )
}

function matchesCategory(row: ModuleRecord, category: string): boolean {
  return row.filterCategories.includes(category)
}

export async function findAll(filters: ConfigModuleListFilters) {
  const { skip, take } = getSkipTake(filters.page, filters.limit)
  const includeDeleted = Boolean(filters.includeDeleted)
  const availableOnly = Boolean(filters.availableOnly)
  const search = filters.search?.trim()
  const category = filters.category?.trim()

  const commonWhere = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(availableOnly ? { isAvailable: true } : {}),
    ...(category ? { filterCategories: { has: category } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const userWhere = {
    userId: filters.userId,
    ...(filters.logConfigurationId != null
      ? { logConfigurationId: filters.logConfigurationId }
      : {}),
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(availableOnly ? { isAvailable: true } : {}),
    ...(category ? { filterCategories: { has: category } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
            { sourceSlug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const wantCommon = !filters.scope || filters.scope === "common"
  // When logConfigurationId is set, include that config's user modules (for all/user scope).
  // When unset: only return user modules if scope === "user" (all of them); otherwise common-only.
  const includeUserModules =
    (!filters.scope || filters.scope === "user") &&
    (filters.logConfigurationId != null || filters.scope === "user")

  const [commonRows, userRows] = await Promise.all([
    wantCommon
      ? prisma.configModule.findMany({ where: commonWhere })
      : Promise.resolve([]),
    includeUserModules
      ? prisma.userModule.findMany({ where: userWhere })
      : Promise.resolve([]),
  ])

  let merged: ModuleRecord[] = [
    ...commonRows.map((row) => mapCommon(row)!),
    ...userRows.map((row) => mapUser(row)!),
  ]

  // Extra client-side filters (already applied in where for most cases)
  if (search) merged = merged.filter((row) => matchesSearch(row, search))
  if (category) merged = merged.filter((row) => matchesCategory(row, category))

  const allowedSortFields = ["id", "slug", "title", "sortOrder", "createdAt", "scope"] as const
  type SortField = (typeof allowedSortFields)[number]
  const sortField: SortField = (allowedSortFields as readonly string[]).includes(filters.sortBy ?? "")
    ? (filters.sortBy as SortField)
    : "sortOrder"
  const sortDir = filters.sortOrder === "desc" ? -1 : 1

  merged.sort((a, b) => {
    // Prefer common before user when sorting by scope / default
    if (sortField === "scope" || sortField === "sortOrder") {
      if (a.scope !== b.scope) return a.scope === "common" ? -1 : 1
    }
    const av = a[sortField]
    const bv = b[sortField]
    if (av == null && bv == null) return a.id - b.id
    if (av == null) return 1
    if (bv == null) return -1
    if (av < bv) return -1 * sortDir
    if (av > bv) return 1 * sortDir
    return a.id - b.id
  })

  const total = merged.length
  const data = merged.slice(skip, skip + take)

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export async function findByIdForUser(id: number, userId: number): Promise<ModuleRecord | null> {
  const userRow = await prisma.userModule.findFirst({
    where: { id, userId },
  })
  if (userRow) return mapUser(userRow)

  return mapCommon(
    await prisma.configModule.findFirst({
      where: { id },
    })
  )
}

export async function createUserModule(
  userId: number,
  data: CreateUserModuleInput
): Promise<ModuleRecord> {
  const row = await prisma.userModule.create({
    data: {
      userId,
      logConfigurationId: data.logConfigurationId,
      slug: data.slug.trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      tags: toJsonTags(data.tags),
      filterCategories: data.filterCategories.map((entry) => entry.trim()).filter(Boolean),
      sourceSlug: data.sourceSlug?.trim() || null,
      ...(data.settings
        ? { settings: data.settings as unknown as Prisma.InputJsonValue }
        : {}),
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  return mapUser(row)!
}

export async function updateUserModule(
  id: number,
  userId: number,
  data: UpdateUserModuleInput
): Promise<ModuleRecord> {
  const payload: Prisma.UserModuleUncheckedUpdateInput = {}
  if (data.slug !== undefined) payload.slug = data.slug.trim()
  if (data.title !== undefined) payload.title = data.title.trim()
  if (data.description !== undefined) payload.description = data.description.trim()
  if (data.tags !== undefined) payload.tags = toJsonTags(data.tags)
  if (data.filterCategories !== undefined) {
    payload.filterCategories = data.filterCategories.map((entry) => entry.trim()).filter(Boolean)
  }
  if (data.sourceSlug !== undefined) {
    payload.sourceSlug = data.sourceSlug?.trim() || null
  }
  if (data.settings !== undefined) {
    payload.settings =
      data.settings == null
        ? Prisma.DbNull
        : (data.settings as unknown as Prisma.InputJsonValue)
  }
  if (data.isAvailable !== undefined) payload.isAvailable = data.isAvailable
  if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder

  const existing = await prisma.userModule.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!existing) {
    throw new Error("USER_MODULE_NOT_FOUND")
  }

  const row = await prisma.userModule.update({
    where: { id },
    data: payload,
  })
  return mapUser(row)!
}

export async function softDeleteUserModule(id: number, userId: number) {
  return prisma.userModule.updateMany({
    where: { id, userId, deletedAt: null },
    data: { deletedAt: new Date(), isAvailable: false },
  })
}

/** Restore a soft-deleted user module (e.g. when re-adopting the same template). */
export async function restoreUserModule(
  id: number,
  userId: number,
  data: {
    title?: string
    description?: string
    settings?: StoredModuleSettings | null
    isAvailable?: boolean
    sortOrder?: number
  } = {}
): Promise<ModuleRecord | null> {
  const payload: Prisma.UserModuleUncheckedUpdateInput = {
    deletedAt: null,
    isAvailable: data.isAvailable ?? true,
  }
  if (data.title !== undefined) payload.title = data.title.trim()
  if (data.description !== undefined) payload.description = data.description.trim()
  if (data.settings !== undefined) {
    payload.settings =
      data.settings === null
        ? Prisma.JsonNull
        : (data.settings as unknown as Prisma.InputJsonValue)
  }
  if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder

  const result = await prisma.userModule.updateMany({
    where: { id, userId },
    data: payload,
  })
  if (result.count === 0) return null

  return mapUser(
    await prisma.userModule.findFirst({
      where: { id, userId },
    })
  )
}
