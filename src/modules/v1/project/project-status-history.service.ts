import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import * as projectRepo from "./project.repository"
import * as historyRepo from "./project-status-history.repository"
import { STATUS_LABELS, toDTO, toProjectStatus } from "./project.mapper"

function formatUserName(firstName: string, lastName: string): string {
  const name = `${firstName} ${lastName}`.trim()
  return name || "System"
}

function toHistoryDTO(
  entry: Awaited<ReturnType<typeof historyRepo.findByProjectId>>[number]
) {
  return {
    id: entry.id,
    status: STATUS_LABELS[entry.status],
    createdAt: entry.createdAt.toISOString(),
    user: formatUserName(entry.user.firstName, entry.user.lastName),
  }
}

async function assertProjectForUser(userId: number, projectId: number) {
  const project = await projectRepo.findByIdForUser(projectId, userId)
  if (!project || project.deletedAt || project.archivedAt) {
    throw new NotFoundError("Project not found")
  }
  return project
}

export async function list(userId: number, projectId: number) {
  await assertProjectForUser(userId, projectId)
  const entries = await historyRepo.findByProjectId(projectId)
  return entries.map(toHistoryDTO)
}

export async function addStatusUpdate(userId: number, projectId: number, statusInput: string) {
  const project = await assertProjectForUser(userId, projectId)
  const nextStatus = toProjectStatus(statusInput)

  if (project.status === nextStatus) {
    throw new ValidationError("Project already has this status")
  }

  const [entry, updatedProject] = await Promise.all([
    historyRepo.createEntry(projectId, userId, nextStatus),
    projectRepo.update(projectId, userId, { status: nextStatus }),
  ])

  return {
    project: toDTO(updatedProject),
    entry: toHistoryDTO(entry),
  }
}
