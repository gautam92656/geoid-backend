/**
 * Generate Well Logs option types, defaults, repos, services, seeds, and controller.
 * Run: node scripts/generateWellLogsCrud.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const meta = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_well_logs_collections.json"), "utf8")
)

const MODULE_SLUG = "well-logs"

function pascal(key) {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function camelPrisma(model) {
  return model.charAt(0).toLowerCase() + model.slice(1)
}

function humanLabel(dataTypeId) {
  return dataTypeId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function singularLabel(dataTypeId) {
  const h = humanLabel(dataTypeId)
  return h.replace(/s$/i, "") || h
}

function keyPrefix(dataTypeId) {
  return dataTypeId.replace(/s$/, "").replace(/ies$/, "y") || dataTypeId
}

function fieldDtoType(f) {
  if (f.prisma.startsWith("Boolean")) return "boolean"
  if (f.prisma.startsWith("String?")) return "string | null"
  if (f.name === "type") return '"surface" | "regular"'
  if (f.name === "graphicAlignment") return '"top" | "bottom"'
  return "string"
}

function fieldDtoOptional(f) {
  return f.prisma.includes("?") || f.prisma.startsWith("Boolean") || f.prismaDefault
}

function dtoTypeFields(fields) {
  const lines = ["  id: string", "  name: string"]
  for (const f of fields) {
    const opt = fieldDtoOptional(f) ? "?" : ""
    lines.push(`  ${f.name}${opt}: ${fieldDtoType(f)}`)
  }
  return lines.join("\n")
}

function parseFieldBody(fields, dtoName) {
  const lines = []
  for (const f of fields) {
    if (f.name === "tablogsAlias") {
      lines.push(`    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),`)
    } else if (f.name === "graphic") {
      lines.push(`    graphic: asNullableString(value.graphic),`)
    } else if (f.name === "allowNegativeDepth") {
      const def = f.prismaDefault === "true"
      lines.push(`    allowNegativeDepth: (() => {
      const unset =
        value.allowNegativeDepth === undefined && value.allow_negative_depth === undefined
      return unset
        ? ${def}
        : asBool(value.allowNegativeDepth) || asBool(value.allow_negative_depth)
    })(),`)
    } else if (f.name === "type") {
      lines.push(`    type: asWellCasingKind(value.type),`)
    } else if (f.name === "graphicAlignment") {
      lines.push(`    graphicAlignment: asGraphicAlignment(
      value.graphicAlignment ?? value.graphic_alignment
    ),`)
    } else if (f.name === "recordDepthTo") {
      const def = f.prismaDefault !== "false"
      lines.push(`    recordDepthTo: (() => {
      const unset =
        value.recordDepthTo === undefined && value.record_depth_to === undefined
      return unset
        ? ${def}
        : asBool(value.recordDepthTo) || asBool(value.record_depth_to)
    })(),`)
    }
  }
  return lines.join("\n")
}

function needsCasingKind(fields) {
  return fields.some((f) => f.name === "type")
}
function needsAlignment(fields) {
  return fields.some((f) => f.name === "graphicAlignment")
}

// --- option types ---
{
  const helpers = `function isRecord(value: unknown): value is Record<string, unknown> {
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

function asWellCasingKind(value: unknown): "surface" | "regular" {
  if (typeof value === "string") {
    const n = value.trim().toLowerCase()
    if (n === "regular") return "regular"
  }
  return "surface"
}

function asGraphicAlignment(value: unknown): "top" | "bottom" {
  if (typeof value === "string" && value.trim().toLowerCase() === "top") return "top"
  return "bottom"
}
`

  let out = `export const WELL_LOGS_MODULE_SLUG = "${MODULE_SLUG}" as const\n\n`
  for (const c of meta) {
    const constName = c.dataTypeId.replace(/-/g, "_").toUpperCase() + "_DATA_TYPE_ID"
    out += `export const ${constName} = "${c.dataTypeId}" as const\n`
  }
  out += "\n" + helpers + "\n"

  for (const c of meta) {
    const dto = pascal(c.key) + "DTO"
    const parseOne = `parse${pascal(c.key)}DTO`
    const parseList = `parse${pascal(c.key)}DTOList`
    const prefix = keyPrefix(c.dataTypeId)

    out += `export type ${dto} = {\n${dtoTypeFields(c.fields)}\n}\n\n`
    out += `export function ${parseOne}(
  value: unknown,
  index: number
): ${dto} | null {
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
          : \`${prefix}-\${index + 1}\`

  return {
    id,
    name,
${parseFieldBody(c.fields, dto)}
  }
}

export function ${parseList}(value: unknown): ${dto}[] {
  if (!Array.isArray(value)) return []
  const options: ${dto}[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = ${parseOne}(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

`
  }

  out += `export function createWellLogsOptionKey(
  prefix: string,
  name: string,
  index: number
): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return \`\${slug || prefix}-\${Date.now().toString(36)}-\${index}\`
}
`

  fs.writeFileSync(
    path.join(root, "src/shared/constants/wellLogsOptionTypes.ts"),
    out
  )
  console.log("Wrote wellLogsOptionTypes.ts")
}

// --- defaults ---
{
  let out = `import {\n`
  for (const c of meta) {
    out += `  parse${pascal(c.key)}DTOList,\n  type ${pascal(c.key)}DTO,\n`
  }
  out += `} from "./wellLogsOptionTypes"\n`

  for (const c of meta) {
    const importName = c.defaultsFile.replace(".json", "")
    out += `import ${importName} from "../data/${c.defaultsFile}"\n`
  }
  out += `\nconst MODULE_SLUG = "${MODULE_SLUG}"\n\n`

  for (const c of meta) {
    const importName = c.defaultsFile.replace(".json", "")
    out += `export function getModule${pascal(c.key)}Defaults(
  moduleSlug: string
): ${pascal(c.key)}DTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parse${pascal(c.key)}DTOList(${importName})
}

export function moduleHas${pascal(c.key)}Defaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

`
  }

  fs.writeFileSync(
    path.join(root, "src/shared/constants/wellLogsOptionDefaults.ts"),
    out
  )
  console.log("Wrote wellLogsOptionDefaults.ts")
}

function fieldsFromDtoFn(c) {
  const lines = [
    `  return {`,
    `    optionKey: option.id.trim(),`,
    `    name: option.name.trim(),`,
  ]
  for (const f of c.fields) {
    if (f.name === "tablogsAlias") {
      lines.push(`    tablogsAlias: option.tablogsAlias?.trim() || null,`)
    } else if (f.name === "graphic") {
      lines.push(`    graphic: option.graphic?.trim() || null,`)
    } else if (f.name === "allowNegativeDepth") {
      const def = f.prismaDefault === "true"
      lines.push(`    allowNegativeDepth: option.allowNegativeDepth ?? ${def},`)
    } else if (f.name === "type") {
      lines.push(`    type: option.type === "regular" ? "regular" : "surface",`)
    } else if (f.name === "graphicAlignment") {
      lines.push(
        `    graphicAlignment: option.graphicAlignment === "top" ? "top" : "bottom",`
      )
    } else if (f.name === "recordDepthTo") {
      const def = f.prismaDefault !== "false"
      lines.push(`    recordDepthTo: option.recordDepthTo ?? ${def},`)
    }
  }
  lines.push(`    sortOrder,`, `  }`)
  return lines.join("\n")
}

function toDtoReturn(c) {
  const lines = [`    id: row.optionKey,`, `    name: row.name,`]
  for (const f of c.fields) {
    if (f.name === "type") {
      lines.push(
        `    type: row.type === "regular" ? "regular" : "surface",`
      )
    } else if (f.name === "graphicAlignment") {
      lines.push(
        `    graphicAlignment: row.graphicAlignment === "top" ? "top" : "bottom",`
      )
    } else {
      lines.push(`    ${f.name}: row.${f.name},`)
    }
  }
  return lines.join("\n")
}

function templateRowType(c) {
  const extra = c.fields
    .map((f) => {
      if (f.prisma.startsWith("Boolean")) return `  ${f.name}: boolean`
      if (f.prisma.startsWith("String?")) return `  ${f.name}: string | null`
      if (f.name === "type") return `  ${f.name}: string`
      if (f.name === "graphicAlignment") return `  ${f.name}: string`
      return `  ${f.name}: string`
    })
    .join("\n")
  return `type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
${extra ? extra + "\n" : ""}  sortOrder: number
}`
}

function updateFieldsFrom(fields) {
  return fields.map((f) => `      ${f.name}: fields.${f.name},`).join("\n")
}

function createFromTemplateMap(c) {
  return c.fields.map((f) => `      ${f.name}: template.${f.name},`).join("\n")
}

// --- repos + services + seeds ---
for (const c of meta) {
  const dto = pascal(c.key) + "DTO"
  const parseOne = `parse${pascal(c.key)}DTO`
  const parseList = `parse${pascal(c.key)}DTOList`
  const tplClient = camelPrisma(c.modelTpl)
  const userClient = camelPrisma(c.modelUser)
  const dataTypeConst =
    c.dataTypeId.replace(/-/g, "_").toUpperCase() + "_DATA_TYPE_ID"
  const label = singularLabel(c.dataTypeId)
  const labelPlural = humanLabel(c.dataTypeId)
  const prefix = keyPrefix(c.dataTypeId)
  const ensureTpl = `ensure${pascal(c.key)}Templates`
  const ensureUser = `ensureUser${pascal(c.key)}s`
  const getTpl = `get${pascal(c.key)}Templates`
  const getUser = `getUser${pascal(c.key)}s`
  const saveUser = `saveUser${pascal(c.key)}s`
  const createUser = `createUser${pascal(c.key)}`
  const updateUser = `updateUser${pascal(c.key)}`
  const deleteUser = `deleteUser${pascal(c.key)}`
  const resetUser = `resetUser${pascal(c.key)}s`
  const toDto = `to${pascal(c.key)}DTO`
  const listTpl = `listTemplatesByModuleSlug`
  const countUser = `countUser${pascal(c.key)}s`
  const listUser = `listUser${pascal(c.key)}s`
  const deleteUsers = `deleteUser${pascal(c.key)}s`
  const createFromTpl = `createUser${pascal(c.key)}sFromTemplates`
  const replaceUser = `replaceUser${pascal(c.key)}s`
  const findUser = `findUser${pascal(c.key)}`
  const hasDefaults = `moduleHas${pascal(c.key)}Defaults`
  const getDefaults = `getModule${pascal(c.key)}Defaults`

  // repository
  const repo = `import { prisma } from "../../../infrastructure/database/prisma"
import type { ${dto} } from "../../../shared/constants/wellLogsOptionTypes"

${templateRowType(c)}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function ${toDto}(row: {
  optionKey: string
  name: string
${c.fields
  .map((f) => {
    if (f.prisma.startsWith("Boolean")) return `  ${f.name}: boolean`
    if (f.prisma.startsWith("String?")) return `  ${f.name}: string | null`
    return `  ${f.name}: string`
  })
  .join("\n")}
}): ${dto} {
  return {
${toDtoReturn(c)}
  }
}

function fieldsFromDto(option: ${dto}, sortOrder: number) {
${fieldsFromDtoFn(c)}
}

export async function ${listTpl}(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.${tplClient}.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: ${dto},
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.${tplClient}.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
${updateFieldsFrom(c.fields)}
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function ${countUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.${userClient}.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function ${listUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.${userClient}.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function ${deleteUsers}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.${userClient}.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function ${createFromTpl}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.${userClient}.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
${createFromTemplateMap(c)}
      sortOrder: template.sortOrder,
    })),
  })

  return ${listUser}(userId, logConfigurationId, slug)
}

export async function ${replaceUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: ${dto}[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await ${deleteUsers}(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.${userClient}.createMany({
    data: options.map((option, index) => {
      const fields = fieldsFromDto(option, index)
      return {
        userId,
        logConfigurationId,
        moduleSlug: slug,
        sourceTemplateId: null,
        ...fields,
      }
    }),
  })

  return ${listUser}(userId, logConfigurationId, slug)
}

export async function ${findUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.${userClient}.findUnique({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
  if (!row || row.userId !== userId) return null
  return row
}

export async function ${createUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: ${dto},
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.${userClient}.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function ${updateUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: ${dto},
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await ${findUser}(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_${c.key.toUpperCase()}_NOT_FOUND")
  }

  return prisma.${userClient}.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
${updateFieldsFrom(c.fields)}
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function ${deleteUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await ${findUser}(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_${c.key.toUpperCase()}_NOT_FOUND")
  }

  await prisma.${userClient}.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
`

  fs.writeFileSync(
    path.join(
      root,
      `src/modules/v1/config-module/config-module.${c.key}.repository.ts`
    ),
    repo
  )

  // service
  const service = `import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  ${getDefaults},
  ${hasDefaults},
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  ${dataTypeConst},
  createWellLogsOptionKey,
  ${parseOne},
  ${parseList},
  type ${dto},
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as ${c.key}Repo from "./config-module.${c.key}.repository"

function isValidModuleSlug(slug: string): boolean {
  return ${hasDefaults}(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ${ensureTpl}(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module ${labelPlural.toLowerCase()} not found")
  }

  const existing = await ${c.key}Repo.${listTpl}(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = ${getDefaults}(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await ${c.key}Repo.upsertTemplate(moduleSlug, option, index)
  }

  return ${c.key}Repo.${listTpl}(moduleSlug)
}

export async function ${getTpl}(
  moduleSlug: string
): Promise<${dto}[]> {
  const templates = await ${ensureTpl}(moduleSlug)
  return templates.map(${c.key}Repo.${toDto})
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ${ensureUser}(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module ${labelPlural.toLowerCase()} not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await ${c.key}Repo.${countUser}(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return ${c.key}Repo.${listUser}(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = ${parseList}(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      ${dataTypeConst}
    )
  )
  if (legacy.length > 0) {
    return ${c.key}Repo.${replaceUser}(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ${ensureTpl}(moduleSlug)
  return ${c.key}Repo.${createFromTpl}(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function ${getUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<${dto}[]> {
  const rows = await ${ensureUser}(userId, logConfigurationId, moduleSlug)
  return rows.map(${c.key}Repo.${toDto})
}

export async function ${saveUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: ${dto}[]
): Promise<${dto}[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module ${labelPlural.toLowerCase()} not found")
  }

  const parsed = ${parseList}(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid ${labelPlural.toLowerCase()} provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("${prefix}", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ${ensureUser}(userId, configId, moduleSlug)
  const rows = await ${c.key}Repo.${replaceUser}(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(${c.key}Repo.${toDto})
}

export async function ${createUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: ${dto}
): Promise<${dto}> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module ${labelPlural.toLowerCase()} not found")
  }

  const parsed = ${parseOne}(option, 0)
  if (!parsed) throw new ValidationError("Invalid ${label.toLowerCase()}")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ${ensureUser}(userId, configId, moduleSlug)
  const existing = await ${c.key}Repo.${listUser}(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("${prefix}", parsed.name, existing.length)

  if (
    await ${c.key}Repo.${findUser}(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A ${label.toLowerCase()} with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A ${label.toLowerCase()} with this name already exists")
  }

  const row = await ${c.key}Repo.${createUser}(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return ${c.key}Repo.${toDto}(row)
}

export async function ${updateUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: ${dto}
): Promise<${dto}> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module ${labelPlural.toLowerCase()} not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await ${c.key}Repo.${findUser}(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("${label} not found")

  const parsed = ${parseOne}({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid ${label.toLowerCase()}")

  const siblings = await ${c.key}Repo.${listUser}(
    ownerUserId,
    configId,
    moduleSlug
  )
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A ${label.toLowerCase()} with this name already exists")
  }

  const row = await ${c.key}Repo.${updateUser}(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return ${c.key}Repo.${toDto}(row)
}

export async function ${deleteUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module ${labelPlural.toLowerCase()} not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await ${c.key}Repo.${findUser}(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("${label} not found")

  await ${c.key}Repo.${deleteUser}(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function ${resetUser}(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<${dto}[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module ${labelPlural.toLowerCase()} not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ${ensureTpl}(moduleSlug)
  await ${c.key}Repo.${deleteUsers}(ownerUserId, configId, moduleSlug)
  const rows = await ${c.key}Repo.${createFromTpl}(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(${c.key}Repo.${toDto})
}
`

  fs.writeFileSync(
    path.join(
      root,
      `src/modules/v1/config-module/config-module.${c.key}.service.ts`
    ),
    service
  )

  // seed
  const seedUpdate = c.fields
    .map((f) => {
      if (f.prisma.startsWith("Boolean")) {
        const def = f.prismaDefault === "true"
        return `          ${f.name}: option.${f.name} ?? ${def},`
      }
      if (f.name === "type") {
        return `          type: option.type === "regular" ? "regular" : "surface",`
      }
      if (f.name === "graphicAlignment") {
        return `          graphicAlignment: option.graphicAlignment === "top" ? "top" : "bottom",`
      }
      return `          ${f.name}: option.${f.name} ?? null,`
    })
    .join("\n")

  const seed = `import type { PrismaClient } from "../../src/generated/prisma/client"
import { ${getDefaults} } from "../../src/shared/constants/wellLogsOptionDefaults"
import { WELL_LOGS_MODULE_SLUG } from "../../src/shared/constants/wellLogsOptionTypes"

const MODULE_SLUGS = [WELL_LOGS_MODULE_SLUG] as const

export async function seed${pascal(c.key)}Templates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = ${getDefaults}(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.${tplClient}.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
${seedUpdate}
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
${seedUpdate}
          sortOrder: index,
        },
      })
    }

    console.log(
      \`  Seeded \${defaults.length} ${labelPlural.toLowerCase()} templates for module "\${moduleSlug}"\`
    )
  }
}
`

  fs.writeFileSync(
    path.join(root, `prisma/seed/${c.key}Templates.ts`),
    seed
  )

  console.log(`Wrote ${c.key} repo/service/seed`)
}

// --- controller ---
{
  let imports = `import type { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../../../shared/constants"
import { API_MESSAGES } from "../../../shared/constants/apiMessages"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { successResponse } from "../../../shared/utils/apiResponse"
import type { AuthedRequest } from "../../../types/auth"
import {
  logConfigurationIdRequiredQuerySchema,
  moduleSlugParamValidationSchema,
  wellLogsOptionKeyParamValidationSchema,
`

  for (const c of meta) {
    imports += `  ${c.key}Schema,\n  save${pascal(c.key)}sBodySchema,\n`
  }
  imports += `} from "./config-module.validation"\n`

  for (const c of meta) {
    imports += `import * as ${c.key}Service from "./config-module.${c.key}.service"\n`
  }

  let body = `
function getUserId(req: Request): number | null {
  const userId = (req as AuthedRequest).user?.sub
  return typeof userId === "number" && userId > 0 ? userId : null
}

function parseRequiredLogConfigurationId(
  req: Request
): { ok: true; logConfigurationId: number } | { ok: false; message: string } {
  const { error, value } = logConfigurationIdRequiredQuerySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
    allowUnknown: true,
  })
  if (error) {
    return { ok: false, message: error.details.map((d) => d.message).join("; ") }
  }
  return { ok: true, logConfigurationId: value.logConfigurationId }
}
`

  for (const c of meta) {
    const P = pascal(c.key)
    const label = singularLabel(c.dataTypeId)
    body += `
export async function get${P}Templates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await ${c.key}Service.get${P}Templates(value.moduleSlug)
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function getUser${P}s(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await ${c.key}Service.getUser${P}s(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, undefined, HTTP_STATUS.OK)
}

export async function saveUser${P}s(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = save${P}sBodySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const options = Array.isArray(value) ? value : value.options
  const data = await ${c.key}Service.saveUser${P}s(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    options
  )
  successResponse(res, data, API_MESSAGES.UPDATED, HTTP_STATUS.OK)
}

export async function createUser${P}(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } = moduleSlugParamValidationSchema.validate(
    req.params,
    { abortEarly: false }
  )
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = ${c.key}Schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await ${c.key}Service.createUser${P}(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    value
  )
  successResponse(res, data, API_MESSAGES.CREATED, HTTP_STATUS.CREATED)
}

export async function resetUser${P}s(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = moduleSlugParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const data = await ${c.key}Service.resetUser${P}s(
    userId,
    configId.logConfigurationId,
    value.moduleSlug
  )
  successResponse(res, data, API_MESSAGES.UPDATED, HTTP_STATUS.OK)
}

export async function updateUser${P}(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error: paramError, value: params } =
    wellLogsOptionKeyParamValidationSchema.validate(req.params, { abortEarly: false })
  if (paramError) {
    next(new ValidationError(paramError.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  const { error, value } = ${c.key}Schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const data = await ${c.key}Service.updateUser${P}(
    userId,
    configId.logConfigurationId,
    params.moduleSlug,
    params.optionKey,
    value
  )
  successResponse(res, data, API_MESSAGES.UPDATED, HTTP_STATUS.OK)
}

export async function deleteUser${P}(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = getUserId(req)
  if (!userId) {
    next(new ValidationError("Unauthorized"))
    return
  }

  const { error, value } = wellLogsOptionKeyParamValidationSchema.validate(req.params, {
    abortEarly: false,
  })
  if (error) {
    next(new ValidationError(error.details.map((d) => d.message).join("; ")))
    return
  }

  const configId = parseRequiredLogConfigurationId(req)
  if (!configId.ok) {
    next(new ValidationError(configId.message))
    return
  }

  await ${c.key}Service.deleteUser${P}(
    userId,
    configId.logConfigurationId,
    value.moduleSlug,
    value.optionKey
  )
  successResponse(res, { deleted: true }, API_MESSAGES.DELETED, HTTP_STATUS.OK)
}
`
  }

  fs.writeFileSync(
    path.join(
      root,
      "src/modules/v1/config-module/config-module.wellLogs.controller.ts"
    ),
    imports + body
  )
  console.log("Wrote wellLogs.controller.ts")
}

console.log("Done generating Well Logs CRUD.")
