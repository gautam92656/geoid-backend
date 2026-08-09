export const LOG_CONFIGURATION_TEMPLATE_SLUG_MAX_LENGTH = 100
export const LOG_CONFIGURATION_TEMPLATE_NAME_MAX_LENGTH = 500
export const LOG_CONFIGURATION_TEMPLATE_DESCRIPTION_MAX_LENGTH = 2000
export const LOG_CONFIGURATION_TEMPLATE_REGION_MAX_LENGTH = 10

export const LOG_CONFIGURATION_TEMPLATE_REGIONS = ["AU"] as const
export type LogConfigurationTemplateRegion =
  (typeof LOG_CONFIGURATION_TEMPLATE_REGIONS)[number]

export const LOG_CONFIGURATION_TEMPLATE_DISCIPLINES = ["Geotechnical", "Environmental"] as const
export type LogConfigurationTemplateDiscipline =
  (typeof LOG_CONFIGURATION_TEMPLATE_DISCIPLINES)[number]

export const DEFAULT_LOG_CONFIGURATION_TEMPLATES = [
  {
    slug: "as1726-environmental",
    name: "AS1726-2017 - Australian - Environmental",
    description:
      "Environmental investigation logging aligned with AS1726-2017, covering groundwater monitoring, soil sampling, and contamination assessment workflows.",
    region: "AU" as const,
    disciplines: ["Environmental"] as const,
    isAvailable: true,
    sortOrder: 1,
  },
  {
    slug: "as1726-rev2",
    name: "AS1726-2017 - Australian Standard for Geotechnical Investigations - Revision 2",
    description:
      "Geotechnical borehole and test pit logging based on AS1726-2017 Revision 2 for Australian site investigation and foundation design projects.",
    region: "AU" as const,
    disciplines: ["Geotechnical"] as const,
    isAvailable: true,
    sortOrder: 2,
  },
] as const
