import type { ProjectStatus } from "../../../generated/prisma/client"
import * as repo from "./project.repository"

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  to_do: "To do",
  in_planning: "In planning",
  scheduled: "Scheduled",
  onsite_works: "Onsite works",
  onsite_works_completed: "Onsite works completed",
  lab_testing: "Lab testing",
  reporting: "Reporting",
  complete: "Complete",
  in_progress: "Onsite works",
  completed: "Complete",
}

const STATUS_VALUES: Record<string, ProjectStatus> = {
  Draft: "draft",
  "To do": "to_do",
  "In planning": "in_planning",
  Scheduled: "scheduled",
  "Onsite works": "onsite_works",
  "Onsite works completed": "onsite_works_completed",
  "Lab testing": "lab_testing",
  Reporting: "reporting",
  Complete: "complete",
  draft: "draft",
  to_do: "to_do",
  in_planning: "in_planning",
  scheduled: "scheduled",
  onsite_works: "onsite_works",
  onsite_works_completed: "onsite_works_completed",
  lab_testing: "lab_testing",
  reporting: "reporting",
  complete: "complete",
  "In progress": "onsite_works",
  in_progress: "onsite_works",
  Completed: "complete",
  completed: "complete",
}

export function toProjectStatus(value: string): ProjectStatus {
  return STATUS_VALUES[value] ?? "to_do"
}

export function toDTO(project: NonNullable<Awaited<ReturnType<typeof repo.findByIdForUser>>>) {
  return {
    id: project.id,
    projectNo: project.projectNo,
    name: project.name,
    location: project.address ?? "",
    address: project.address ?? "",
    assignee: project.assignee ?? "",
    client: project.client?.companyName ?? "",
    clientId: project.clientId,
    status: STATUS_LABELS[project.status],
    brief: project.brief ?? "",
    logConfigId: project.logConfigId ?? "",
    office: project.office ?? "",
    startDate: project.startDate?.toISOString().slice(0, 10) ?? "",
    endDate: project.endDate?.toISOString().slice(0, 10) ?? "",
    coordinateSystem: project.coordinateSystem ?? "",
    latitude: project.latitude ?? "",
    longitude: project.longitude ?? "",
    easting: project.easting ?? "",
    northing: project.northing ?? "",
    utmZone: project.utmZone ?? "",
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    archivedAt: project.archivedAt?.toISOString() ?? null,
    deletedAt: project.deletedAt?.toISOString() ?? null,
  }
}
