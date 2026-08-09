export const LOG_CONFIGURATION_FIELD_GROUPS = ["project_detail", "log_detail"] as const

export type LogConfigurationFieldGroup = (typeof LOG_CONFIGURATION_FIELD_GROUPS)[number]

export const LOG_CONFIGURATION_FIELD_GROUP_URL_SEGMENTS: Record<
  LogConfigurationFieldGroup,
  string
> = {
  project_detail: "project-detail",
  log_detail: "log-detail",
}

const URL_SEGMENT_TO_FIELD_GROUP = Object.fromEntries(
  Object.entries(LOG_CONFIGURATION_FIELD_GROUP_URL_SEGMENTS).map(([group, segment]) => [
    segment,
    group,
  ])
) as Record<string, LogConfigurationFieldGroup>

export function parseLogConfigurationFieldGroupFromUrl(
  segment: string
): LogConfigurationFieldGroup | null {
  return URL_SEGMENT_TO_FIELD_GROUP[segment] ?? null
}

export function getLogConfigurationFieldGroupUrlSegment(
  group: LogConfigurationFieldGroup
): string {
  return LOG_CONFIGURATION_FIELD_GROUP_URL_SEGMENTS[group]
}
