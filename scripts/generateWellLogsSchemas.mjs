import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const schemaDir = path.join(root, "prisma/schema")
const dataDir = path.join(root, "src/shared/data")
const migDir = path.join(root, "prisma/migrations/20260731180000_well_logs_collections")

const collections = [
  {
    key: "wellType",
    modelTpl: "WellTypeTemplate",
    modelUser: "UserWellType",
    tableTpl: "well_type_templates",
    tableUser: "user_well_types",
    idx: "well_type",
    dataTypeId: "well-types",
    defaultsFile: "wellTypeOptionsDefaults.json",
    defaults: [
      {
        id: "pvc-solid",
        name: "50mm PVC Solid",
        tablogsAlias: "solid",
        graphic: "solidBlack.png",
        allowNegativeDepth: false,
      },
      {
        id: "pvc-slotted",
        name: "50mm PVC Slotted",
        tablogsAlias: "slotted",
        graphic: "slotted.png",
        allowNegativeDepth: false,
      },
    ],
    fields: [
      { name: "tablogsAlias", prisma: "String?", map: "tablogs_alias", sql: "VARCHAR(100)" },
      { name: "graphic", prisma: "String?", map: null, sql: "VARCHAR(255)" },
      {
        name: "allowNegativeDepth",
        prisma: "Boolean",
        map: "allow_negative_depth",
        sql: "BOOLEAN NOT NULL DEFAULT false",
        prismaDefault: "false",
      },
    ],
  },
  {
    key: "wellCasingType",
    modelTpl: "WellCasingTypeTemplate",
    modelUser: "UserWellCasingType",
    tableTpl: "well_casing_type_templates",
    tableUser: "user_well_casing_types",
    idx: "well_casing",
    dataTypeId: "well-casing-types",
    defaultsFile: "wellCasingTypeOptionsDefaults.json",
    defaults: [
      {
        id: "surface-casing",
        name: "Surface Casing",
        tablogsAlias: "Surface Casing",
        type: "surface",
        graphic: "graphic_02.png",
        allowNegativeDepth: false,
      },
      {
        id: "regular-casing",
        name: "Regular Casing",
        tablogsAlias: "Regular Casing",
        type: "regular",
        graphic: "graphic_01.png",
        allowNegativeDepth: false,
      },
    ],
    fields: [
      { name: "tablogsAlias", prisma: "String?", map: "tablogs_alias", sql: "VARCHAR(100)" },
      {
        name: "type",
        prisma: "String",
        map: null,
        sql: "VARCHAR(20) NOT NULL DEFAULT 'surface'",
        prismaDefault: '"surface"',
        db: "VarChar(20)",
      },
      { name: "graphic", prisma: "String?", map: null, sql: "VARCHAR(255)" },
      {
        name: "allowNegativeDepth",
        prisma: "Boolean",
        map: "allow_negative_depth",
        sql: "BOOLEAN NOT NULL DEFAULT false",
        prismaDefault: "false",
      },
    ],
  },
  {
    key: "wellCasingTop",
    modelTpl: "WellCasingTopTemplate",
    modelUser: "UserWellCasingTop",
    tableTpl: "well_casing_top_templates",
    tableUser: "user_well_casing_tops",
    idx: "well_casing_top",
    dataTypeId: "well-casing-tops",
    defaultsFile: "wellCasingTopOptionsDefaults.json",
    defaults: [
      {
        id: "well-casing-top",
        name: "Well Casing Top",
        tablogsAlias: null,
        graphic: "graphic_01.png",
        allowNegativeDepth: true,
      },
    ],
    fields: [
      { name: "tablogsAlias", prisma: "String?", map: "tablogs_alias", sql: "VARCHAR(100)" },
      { name: "graphic", prisma: "String?", map: null, sql: "VARCHAR(255)" },
      {
        name: "allowNegativeDepth",
        prisma: "Boolean",
        map: "allow_negative_depth",
        sql: "BOOLEAN NOT NULL DEFAULT true",
        prismaDefault: "true",
      },
    ],
  },
  {
    key: "wellCoverType",
    modelTpl: "WellCoverTypeTemplate",
    modelUser: "UserWellCoverType",
    tableTpl: "well_cover_type_templates",
    tableUser: "user_well_cover_types",
    idx: "well_cover",
    dataTypeId: "well-cover-types",
    defaultsFile: "wellCoverTypeOptionsDefaults.json",
    defaults: [
      {
        id: "rounded",
        name: "Rounded",
        tablogsAlias: "rounded",
        graphic: "well_cover_1.png",
        allowNegativeDepth: false,
        graphicAlignment: "bottom",
      },
      {
        id: "flat",
        name: "Flat",
        tablogsAlias: "flat",
        graphic: "well_cover_4.png",
        allowNegativeDepth: false,
        graphicAlignment: "bottom",
      },
    ],
    fields: [
      { name: "tablogsAlias", prisma: "String?", map: "tablogs_alias", sql: "VARCHAR(100)" },
      { name: "graphic", prisma: "String?", map: null, sql: "VARCHAR(255)" },
      {
        name: "allowNegativeDepth",
        prisma: "Boolean",
        map: "allow_negative_depth",
        sql: "BOOLEAN NOT NULL DEFAULT false",
        prismaDefault: "false",
      },
      {
        name: "graphicAlignment",
        prisma: "String",
        map: "graphic_alignment",
        sql: "VARCHAR(20) NOT NULL DEFAULT 'bottom'",
        prismaDefault: '"bottom"',
        db: "VarChar(20)",
      },
    ],
  },
  {
    key: "wellProbeType",
    modelTpl: "WellProbeTypeTemplate",
    modelUser: "UserWellProbeType",
    tableTpl: "well_probe_type_templates",
    tableUser: "user_well_probe_types",
    idx: "well_probe",
    dataTypeId: "well-probe-types",
    defaultsFile: "wellProbeTypeOptionsDefaults.json",
    defaults: [
      {
        id: "soil-vapour",
        name: "Soil Vapour Probe",
        tablogsAlias: "soil-vapour",
        graphic: "probe_graphic_01.png",
        recordDepthTo: true,
      },
    ],
    fields: [
      { name: "tablogsAlias", prisma: "String?", map: "tablogs_alias", sql: "VARCHAR(100)" },
      { name: "graphic", prisma: "String?", map: null, sql: "VARCHAR(255)" },
      {
        name: "recordDepthTo",
        prisma: "Boolean",
        map: "record_depth_to",
        sql: "BOOLEAN NOT NULL DEFAULT true",
        prismaDefault: "true",
      },
    ],
  },
  {
    key: "wellBackfillType",
    modelTpl: "WellBackfillTypeTemplate",
    modelUser: "UserWellBackfillType",
    tableTpl: "well_backfill_type_templates",
    tableUser: "user_well_backfill_types",
    idx: "well_backfill",
    dataTypeId: "well-backfill-types",
    defaultsFile: "wellBackfillTypeOptionsDefaults.json",
    defaults: [
      { id: "blank", name: "Blank", tablogsAlias: null, graphic: "01.png" },
      { id: "backfill", name: "Backfill", tablogsAlias: null, graphic: "10.png" },
      { id: "bentonite", name: "Bentonite", tablogsAlias: null, graphic: "21.png" },
      { id: "filter-pack", name: "Filter Pack", tablogsAlias: null, graphic: "31.png" },
      { id: "concrete-cement", name: "Concrete Cement", tablogsAlias: null, graphic: "41.png" },
      {
        id: "concrete-cement-grout",
        name: "Concrete Cement Grout",
        tablogsAlias: null,
        graphic: "42.png",
      },
    ],
    fields: [
      { name: "tablogsAlias", prisma: "String?", map: "tablogs_alias", sql: "VARCHAR(100)" },
      { name: "graphic", prisma: "String?", map: null, sql: "VARCHAR(255)" },
    ],
  },
  {
    key: "wellDefaultWellId",
    modelTpl: "WellDefaultWellIdTemplate",
    modelUser: "UserWellDefaultWellId",
    tableTpl: "well_default_well_id_templates",
    tableUser: "user_well_default_well_ids",
    idx: "well_def_id",
    dataTypeId: "default-well-ids",
    defaultsFile: "wellDefaultWellIdOptionsDefaults.json",
    defaults: [],
    fields: [],
  },
]

function prismaFieldLine(f) {
  const map = f.map ? ` @map("${f.map}")` : ""
  let db = ""
  if (f.sql.includes("VARCHAR(100)")) db = " @db.VarChar(100)"
  else if (f.sql.includes("VARCHAR(255)")) db = " @db.VarChar(255)"
  else if (f.sql.includes("VARCHAR(20)")) db = " @db.VarChar(20)"
  const def = f.prismaDefault ? ` @default(${f.prismaDefault})` : ""
  const pad = " ".repeat(Math.max(1, 26 - f.name.length))
  return `  ${f.name}${pad}${f.prisma}${def}${map}${db}`
}

function writePrisma(c) {
  const extra = c.fields.map(prismaFieldLine).join("\n")
  const extraBlock = extra ? `${extra}\n` : ""
  const tpl = `/// Common Well Logs catalog defaults.
model ${c.modelTpl} {
  id         Int     @id @default(autoincrement())
  moduleSlug String  @map("module_slug") @db.VarChar(100)
  optionKey  String  @map("option_key") @db.VarChar(100)
  name       String  @db.VarChar(200)
${extraBlock}  sortOrder  Int     @default(0) @map("sort_order")

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@unique([moduleSlug, optionKey], map: "${c.idx}_tpl_module_key")
  @@index([moduleSlug, sortOrder], map: "${c.idx}_tpl_module_sort_idx")
  @@map("${c.tableTpl}")
}
`
  const user = `/// Per-configuration Well Logs options.
model ${c.modelUser} {
  id                 Int     @id @default(autoincrement())
  userId             Int     @map("user_id")
  logConfigurationId Int     @map("log_configuration_id")
  moduleSlug         String  @map("module_slug") @db.VarChar(100)
  optionKey          String  @map("option_key") @db.VarChar(100)
  sourceTemplateId   Int?    @map("source_template_id")
  name               String  @db.VarChar(200)
${extraBlock}  sortOrder          Int     @default(0) @map("sort_order")

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  logConfiguration LogConfiguration @relation(fields: [logConfigurationId], references: [id], onDelete: Cascade)

  @@unique([logConfigurationId, moduleSlug, optionKey], map: "user_${c.idx}_config_key")
  @@index([userId, logConfigurationId, moduleSlug, sortOrder], map: "user_${c.idx}_user_config_idx")
  @@map("${c.tableUser}")
}
`
  fs.writeFileSync(path.join(schemaDir, `${c.key}Template.prisma`), tpl)
  const userFile = c.modelUser[0].toLowerCase() + c.modelUser.slice(1)
  fs.writeFileSync(path.join(schemaDir, `${userFile}.prisma`), user)
  fs.writeFileSync(path.join(dataDir, c.defaultsFile), `${JSON.stringify(c.defaults, null, 2)}\n`)
}

function sqlTable(name, pkey, cols, isUser) {
  const lines = [`CREATE TABLE "${name}" (`, `    "id" SERIAL NOT NULL,`]
  if (isUser) {
    lines.push(`    "user_id" INTEGER NOT NULL,`)
    lines.push(`    "log_configuration_id" INTEGER NOT NULL,`)
  }
  lines.push(`    "module_slug" VARCHAR(100) NOT NULL,`)
  lines.push(`    "option_key" VARCHAR(100) NOT NULL,`)
  if (isUser) lines.push(`    "source_template_id" INTEGER,`)
  lines.push(`    "name" VARCHAR(200) NOT NULL,`)
  for (const f of cols) {
    const col = f.map || f.name.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
    lines.push(`    "${col}" ${f.sql},`)
  }
  lines.push(`    "sort_order" INTEGER NOT NULL DEFAULT 0,`)
  lines.push(`    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,`)
  lines.push(`    "updated_at" TIMESTAMPTZ(6) NOT NULL,`)
  lines.push(``)
  lines.push(`    CONSTRAINT "${pkey}" PRIMARY KEY ("id")`)
  lines.push(`);`)
  return lines.join("\n")
}

fs.mkdirSync(migDir, { recursive: true })
const sql = ["-- Well Logs dedicated collections\n"]
for (const c of collections) {
  writePrisma(c)
  sql.push(sqlTable(c.tableTpl, `${c.tableTpl}_pkey`, c.fields, false))
  sql.push("")
  sql.push(
    `CREATE UNIQUE INDEX "${c.idx}_tpl_module_key" ON "${c.tableTpl}"("module_slug", "option_key");`
  )
  sql.push(
    `CREATE INDEX "${c.idx}_tpl_module_sort_idx" ON "${c.tableTpl}"("module_slug", "sort_order");`
  )
  sql.push("")
  sql.push(sqlTable(c.tableUser, `${c.tableUser}_pkey`, c.fields, true))
  sql.push("")
  sql.push(
    `CREATE UNIQUE INDEX "user_${c.idx}_config_key" ON "${c.tableUser}"("log_configuration_id", "module_slug", "option_key");`
  )
  sql.push(
    `CREATE INDEX "user_${c.idx}_user_config_idx" ON "${c.tableUser}"("user_id", "log_configuration_id", "module_slug", "sort_order");`
  )
  sql.push("")
  sql.push(
    `ALTER TABLE "${c.tableUser}" ADD CONSTRAINT "${c.tableUser}_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
  )
  sql.push(
    `ALTER TABLE "${c.tableUser}" ADD CONSTRAINT "${c.tableUser}_log_configuration_id_fkey" FOREIGN KEY ("log_configuration_id") REFERENCES "log_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
  )
  sql.push("")
}
fs.writeFileSync(path.join(migDir, "migration.sql"), sql.join("\n"))
fs.writeFileSync(
  path.join(root, "scripts/_well_logs_collections.json"),
  `${JSON.stringify(collections, null, 2)}\n`
)
console.log(`Generated ${collections.length} well-logs collections`)
