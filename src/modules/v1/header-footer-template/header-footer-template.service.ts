import type { Prisma } from "../../../generated/prisma/client"
import { ConflictError } from "../../../shared/errors/ConflictError"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import {
  BORELOG_FOOTER_TEMPLATE_SEED,
  BORELOG_HEADER_TEMPLATE_SEED,
  BORELOG_TEMPLATE_SEED_VERSION,
  CORELOG_FOOTER_TEMPLATE_SEED,
  CORELOG_HEADER_TEMPLATE_SEED,
  createBorelogFooterTemplateContent,
  createBorelogHeaderTemplateContent,
  createCorelogFooterTemplateContent,
  createCorelogHeaderTemplateContent,
  getBorelogSeedVersion,
} from "./borelog-template.defaults"
import {
  createDefaultHeaderFooterContent,
  isEmptyContent,
} from "./header-footer-template.defaults"
import * as repo from "./header-footer-template.repository"
import {
  createSitePlanTemplateContent,
  getSitePlanSeedVersion,
  SITE_PLAN_TEMPLATE_SEED,
} from "./site-plan-template.defaults"

function toDTO(template: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: template.id,
    name: template.name,
    kind: template.kind,
    reportType: template.reportType,
    content: template.content,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    deletedAt: template.deletedAt?.toISOString() ?? null,
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

/**
 * Keep seed metadata across saves and mark content as user-edited so future
 * seed upgrades never wipe custom footer/header cells.
 */
function stampSavedContent(
  existingContent: unknown,
  nextContent: Prisma.InputJsonValue | undefined
): Prisma.InputJsonValue | undefined {
  if (nextContent === undefined) return undefined
  const next = asRecord(nextContent)
  if (!next) return nextContent

  const existingSource = asRecord(asRecord(existingContent)?.source) ?? {}
  const nextSource = asRecord(next.source) ?? {}
  const seedVersion = Math.max(
    getSitePlanSeedVersion(existingContent),
    getSitePlanSeedVersion(nextContent),
    getBorelogSeedVersion(existingContent),
    getBorelogSeedVersion(nextContent),
    typeof existingSource.seedVersion === "number" && Number.isFinite(existingSource.seedVersion)
      ? existingSource.seedVersion
      : 0,
    typeof nextSource.seedVersion === "number" && Number.isFinite(nextSource.seedVersion)
      ? nextSource.seedVersion
      : 0
  )

  return {
    ...next,
    source: {
      ...existingSource,
      ...nextSource,
      userModified: true,
      ...(seedVersion > 0 ? { seedVersion } : {}),
    },
  }
}

/**
 * Ensure every user has Site Plan Template 1 (4-column footer + company logo token).
 * Creates when missing only — never overwrite an existing template (user edits must persist).
 */
async function ensureSitePlanTemplate(userId: number) {
  const named = await repo.findByNameKindForUser(
    userId,
    SITE_PLAN_TEMPLATE_SEED.name,
    SITE_PLAN_TEMPLATE_SEED.kind
  )

  if (named) return

  await repo.create({
    userId,
    name: SITE_PLAN_TEMPLATE_SEED.name,
    kind: SITE_PLAN_TEMPLATE_SEED.kind,
    reportType: SITE_PLAN_TEMPLATE_SEED.reportType,
    content: createSitePlanTemplateContent(),
  })
}

function isUserModifiedContent(content: unknown): boolean {
  const source = asRecord(asRecord(content)?.source)
  return source?.userModified === true
}

/**
 * Ensure Borelog Header/Footer Template 1 exist (sample Geotechnical Log PDF layout).
 * Creates when missing. Upgrades seed layouts when seedVersion is behind
 * (header branding bands; footer legend without page numbers).
 * Never overwrite templates the user has already edited.
 */
async function ensureBorelogTemplates(userId: number) {
  const header = await repo.findByNameKindForUser(
    userId,
    BORELOG_HEADER_TEMPLATE_SEED.name,
    BORELOG_HEADER_TEMPLATE_SEED.kind
  )
  if (!header) {
    await repo.create({
      userId,
      name: BORELOG_HEADER_TEMPLATE_SEED.name,
      kind: BORELOG_HEADER_TEMPLATE_SEED.kind,
      reportType: BORELOG_HEADER_TEMPLATE_SEED.reportType,
      content: createBorelogHeaderTemplateContent(),
    })
  } else {
    const existing = await repo.findByIdForUser(header.id, userId)
    if (
      existing &&
      !isUserModifiedContent(existing.content) &&
      getBorelogSeedVersion(existing.content) < BORELOG_TEMPLATE_SEED_VERSION
    ) {
      await repo.update(header.id, userId, {
        content: createBorelogHeaderTemplateContent(),
      })
    }
  }

  const footer = await repo.findByNameKindForUser(
    userId,
    BORELOG_FOOTER_TEMPLATE_SEED.name,
    BORELOG_FOOTER_TEMPLATE_SEED.kind
  )
  if (!footer) {
    await repo.create({
      userId,
      name: BORELOG_FOOTER_TEMPLATE_SEED.name,
      kind: BORELOG_FOOTER_TEMPLATE_SEED.kind,
      reportType: BORELOG_FOOTER_TEMPLATE_SEED.reportType,
      content: createBorelogFooterTemplateContent(),
    })
  } else {
    const existing = await repo.findByIdForUser(footer.id, userId)
    if (
      existing &&
      !isUserModifiedContent(existing.content) &&
      getBorelogSeedVersion(existing.content) < BORELOG_TEMPLATE_SEED_VERSION
    ) {
      await repo.update(footer.id, userId, {
        content: createBorelogFooterTemplateContent(),
      })
    }
  }
}

async function ensureCorelogTemplates(userId: number) {
  const header = await repo.findByNameKindForUser(
    userId,
    CORELOG_HEADER_TEMPLATE_SEED.name,
    CORELOG_HEADER_TEMPLATE_SEED.kind
  )
  if (!header) {
    await repo.create({
      userId,
      name: CORELOG_HEADER_TEMPLATE_SEED.name,
      kind: CORELOG_HEADER_TEMPLATE_SEED.kind,
      reportType: CORELOG_HEADER_TEMPLATE_SEED.reportType,
      content: createCorelogHeaderTemplateContent(),
    })
  } else {
    const existing = await repo.findByIdForUser(header.id, userId)
    if (
      existing &&
      !isUserModifiedContent(existing.content) &&
      getBorelogSeedVersion(existing.content) < BORELOG_TEMPLATE_SEED_VERSION
    ) {
      await repo.update(header.id, userId, {
        content: createCorelogHeaderTemplateContent(),
      })
    }
  }

  const footer = await repo.findByNameKindForUser(
    userId,
    CORELOG_FOOTER_TEMPLATE_SEED.name,
    CORELOG_FOOTER_TEMPLATE_SEED.kind
  )
  if (!footer) {
    await repo.create({
      userId,
      name: CORELOG_FOOTER_TEMPLATE_SEED.name,
      kind: CORELOG_FOOTER_TEMPLATE_SEED.kind,
      reportType: CORELOG_FOOTER_TEMPLATE_SEED.reportType,
      content: createCorelogFooterTemplateContent(),
    })
  } else {
    const existing = await repo.findByIdForUser(footer.id, userId)
    if (
      existing &&
      !isUserModifiedContent(existing.content) &&
      getBorelogSeedVersion(existing.content) < BORELOG_TEMPLATE_SEED_VERSION
    ) {
      await repo.update(footer.id, userId, {
        content: createCorelogFooterTemplateContent(),
      })
    }
  }
}

async function ensureSeededTemplates(userId: number) {
  await ensureSitePlanTemplate(userId)
  await ensureBorelogTemplates(userId)
  await ensureCorelogTemplates(userId)
}

export async function list(filters: repo.HeaderFooterTemplateListFilters) {
  await ensureSeededTemplates(filters.userId)
  const result = await repo.findAll(filters)
  return { ...result, data: result.data.map(toDTO) }
}

export async function getOne(userId: number, id: number) {
  await ensureSeededTemplates(userId)
  const template = await repo.findByIdForUser(id, userId)
  if (!template || template.deletedAt) throw new NotFoundError("Header & footer template not found")
  return toDTO(template)
}

export async function create(userId: number, input: Omit<repo.CreateHeaderFooterTemplateInput, "userId">) {
  await ensureSeededTemplates(userId)

  const duplicateName = await repo.findByNameKindForUser(userId, input.name, input.kind)
  if (duplicateName) {
    throw new ConflictError("A template with this name already exists for this type.")
  }

  const content = isEmptyContent(input.content)
    ? createDefaultHeaderFooterContent()
    : stampSavedContent(null, input.content)

  const template = await repo.create({ ...input, userId, content })
  return toDTO(template)
}

export async function update(userId: number, id: number, input: repo.UpdateHeaderFooterTemplateInput) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Header & footer template not found")

  const nextKind = input.kind ?? existing.kind
  const nextName = input.name ?? existing.name

  if (input.name !== undefined || input.kind !== undefined) {
    const duplicateName = await repo.findByNameKindForUser(userId, nextName, nextKind, id)
    if (duplicateName) {
      throw new ConflictError("A template with this name already exists for this type.")
    }
  }

  const updated = await repo.update(id, userId, {
    ...input,
    content: stampSavedContent(existing.content, input.content),
  })
  return toDTO(updated)
}

export async function remove(userId: number, id: number) {
  const existing = await repo.findByIdForUser(id, userId)
  if (!existing || existing.deletedAt) throw new NotFoundError("Header & footer template not found")
  await repo.softDelete(id, userId)
  return { message: "Header & footer template removed" }
}
