export const CONFIG_MODULE_SLUG_MAX_LENGTH = 100
export const CONFIG_MODULE_TITLE_MAX_LENGTH = 200
export const CONFIG_MODULE_DESCRIPTION_MAX_LENGTH = 2000
export const CONFIG_MODULE_TAG_LABEL_MAX_LENGTH = 100

export const CONFIG_MODULE_SCOPES = ["common", "user"] as const
export type ConfigModuleScope = (typeof CONFIG_MODULE_SCOPES)[number]

export const CONFIG_MODULE_TAG_TONES = ["geotechnical", "category", "region"] as const
export type ConfigModuleTagTone = (typeof CONFIG_MODULE_TAG_TONES)[number]

export type ConfigModuleTag = {
  label: string
  tone: ConfigModuleTagTone
}

export type ConfigModuleCatalogEntry = {
  slug: string
  title: string
  description: string
  tags: readonly ConfigModuleTag[]
  filterCategories: readonly string[]
  isAvailable: boolean
  sortOrder: number
}

/** Modules retired from the library — stripped from enabled lists and soft-removed on sync. */
export const REMOVED_CONFIG_MODULE_SLUGS = [
  "cpt",
  "mwd",
  "ground-water-monitoring",
] as const

export const DEFAULT_COMMON_CONFIG_MODULES: readonly ConfigModuleCatalogEntry[] =
  [
    {
      slug: "insitu-tests-usa",
      title: "Insitu-Tests (USA)",
      description: "Geotechnical field tests for USA",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
        { label: "USA", tone: "region" },
      ],
      filterCategories: ["Geotechnical", "Borelogging", "USA"],
      isAvailable: true,
      sortOrder: 10,
    },
    {
      slug: "core-logging",
      title: "Core Logging",
      description: "Capture core defects and RQD / TCR data",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
        { label: "Core logging", tone: "category" },
      ],
      filterCategories: ["Geotechnical", "Borelogging", "Core logging"],
      isAvailable: true,
      sortOrder: 20,
    },
    {
      slug: "log-report",
      title: "Log Report",
      description: "Manages log reports and their templates.",
      tags: [
        { label: "Logs", tone: "category" },
        { label: "Reporting", tone: "category" },
      ],
      filterCategories: ["Logs", "Reporting"],
      isAvailable: true,
      sortOrder: 30,
    },
    {
      slug: "log-remarks",
      title: "Log Remarks",
      description: "A module to capture additional log remarks",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
        { label: "USA", tone: "region" },
      ],
      filterCategories: ["Geotechnical", "Borelogging", "USA"],
      isAvailable: true,
      sortOrder: 40,
    },
    {
      slug: "subsurfaces",
      title: "Subsurfaces",
      description: "Log borelog subsurface profiles",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
      ],
      filterCategories: ["Geotechnical", "Borelogging"],
      isAvailable: true,
      sortOrder: 50,
    },
    {
      slug: "drilling-observations",
      title: "Drilling Observations",
      description: "Capture drilling methods, resistance, casing, and observations",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
      ],
      filterCategories: ["Geotechnical", "Borelogging"],
      isAvailable: true,
      sortOrder: 60,
    },
    {
      slug: "water-observations",
      title: "Water Observations",
      description: "Record groundwater and water observation entries",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
      ],
      filterCategories: ["Geotechnical", "Borelogging"],
      isAvailable: true,
      sortOrder: 70,
    },
    {
      slug: "well-logs",
      title: "Well Logs",
      description: "Configure well construction details for logs",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
      ],
      filterCategories: ["Geotechnical", "Borelogging"],
      isAvailable: true,
      sortOrder: 80,
    },
    {
      slug: "samples",
      title: "Samples",
      description: "Configure sample collection settings and sample data types for logs",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
      ],
      filterCategories: ["Geotechnical", "Borelogging"],
      isAvailable: true,
      sortOrder: 90,
    },
    {
      slug: "lab-tests",
      title: "Lab Tests",
      description: "Configure lab test types and presets available for log configurations",
      tags: [
        { label: "Geotechnical", tone: "geotechnical" },
        { label: "Borelogging", tone: "category" },
      ],
      filterCategories: ["Geotechnical", "Borelogging"],
      isAvailable: true,
      sortOrder: 100,
    },
  ]

export const CONFIG_MODULE_FILTER_CATEGORIES = [
  "Geotechnical",
  "Borelogging",
  "Logs",
  "Reporting",
  "USA",
  "Core logging",
] as const
