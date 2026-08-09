import { prisma } from "../../../infrastructure/database/prisma"
import type { RemarksQuickNoteDTO } from "../../../shared/constants/logRemarksOptionTypes"

type TemplateRow = {
  id: number
  moduleSlug: string
  optionKey: string
  name: string
  remarkTypeId: string
  sortOrder: number
}

type UserRow = TemplateRow & {
  userId: number
  logConfigurationId: number
  sourceTemplateId: number | null
}

export function toRemarksQuickNoteDTO(row: {
  optionKey: string
  name: string
  remarkTypeId: string
}): RemarksQuickNoteDTO {
  return {
    id: row.optionKey,
    name: row.name,
    remarkTypeId: row.remarkTypeId,
  }
}

function fieldsFromDto(option: RemarksQuickNoteDTO, sortOrder: number) {
  return {
    optionKey: option.id.trim(),
    name: option.name.trim(),
    remarkTypeId: option.remarkTypeId.trim(),
    sortOrder,
  }
}

export async function listTemplatesByModuleSlug(moduleSlug: string): Promise<TemplateRow[]> {
  return prisma.remarksQuickNoteTemplate.findMany({
    where: { moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function upsertTemplate(
  moduleSlug: string,
  option: RemarksQuickNoteDTO,
  sortOrder: number
): Promise<TemplateRow> {
  const slug = moduleSlug.trim()
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.remarksQuickNoteTemplate.upsert({
    where: {
      moduleSlug_optionKey: { moduleSlug: slug, optionKey: fields.optionKey },
    },
    update: {
      name: fields.name,
      remarkTypeId: fields.remarkTypeId,
      sortOrder: fields.sortOrder,
    },
    create: {
      moduleSlug: slug,
      ...fields,
    },
  })
}

export async function countUserRemarksQuickNotes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<number> {
  return prisma.userRemarksQuickNote.count({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function listUserRemarksQuickNotes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<UserRow[]> {
  return prisma.userRemarksQuickNote.findMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })
}

export async function deleteUserRemarksQuickNotes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<void> {
  await prisma.userRemarksQuickNote.deleteMany({
    where: { userId, logConfigurationId, moduleSlug: moduleSlug.trim() },
  })
}

export async function createUserRemarksQuickNotesFromTemplates(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  templates: TemplateRow[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  if (templates.length === 0) return []

  await prisma.userRemarksQuickNote.createMany({
    data: templates.map((template) => ({
      userId,
      logConfigurationId,
      moduleSlug: slug,
      optionKey: template.optionKey,
      sourceTemplateId: template.id,
      name: template.name,
      remarkTypeId: template.remarkTypeId,
      sortOrder: template.sortOrder,
    })),
  })

  return listUserRemarksQuickNotes(userId, logConfigurationId, slug)
}

export async function replaceUserRemarksQuickNotes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: RemarksQuickNoteDTO[]
): Promise<UserRow[]> {
  const slug = moduleSlug.trim()
  await deleteUserRemarksQuickNotes(userId, logConfigurationId, slug)

  if (options.length === 0) return []

  await prisma.userRemarksQuickNote.createMany({
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

  return listUserRemarksQuickNotes(userId, logConfigurationId, slug)
}

export async function findUserRemarksQuickNote(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<UserRow | null> {
  const row = await prisma.userRemarksQuickNote.findUnique({
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

export async function createUserRemarksQuickNote(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: RemarksQuickNoteDTO,
  sortOrder: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder)
  return prisma.userRemarksQuickNote.create({
    data: {
      userId,
      logConfigurationId,
      moduleSlug: moduleSlug.trim(),
      sourceTemplateId: null,
      ...fields,
    },
  })
}

export async function updateUserRemarksQuickNote(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: RemarksQuickNoteDTO,
  sortOrder?: number
): Promise<UserRow> {
  const fields = fieldsFromDto(option, sortOrder ?? 0)
  const existing = await findUserRemarksQuickNote(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_REMARKS_QUICK_NOTE_NOT_FOUND")
  }

  return prisma.userRemarksQuickNote.update({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
    data: {
      name: fields.name,
      remarkTypeId: fields.remarkTypeId,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(fields.optionKey !== optionKey.trim() ? { optionKey: fields.optionKey } : {}),
    },
  })
}

export async function deleteUserRemarksQuickNote(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  const existing = await findUserRemarksQuickNote(
    userId,
    logConfigurationId,
    moduleSlug,
    optionKey
  )
  if (!existing) {
    throw new Error("USER_REMARKS_QUICK_NOTE_NOT_FOUND")
  }

  await prisma.userRemarksQuickNote.delete({
    where: {
      logConfigurationId_moduleSlug_optionKey: {
        logConfigurationId,
        moduleSlug: moduleSlug.trim(),
        optionKey: optionKey.trim(),
      },
    },
  })
}
