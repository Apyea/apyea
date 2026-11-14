import { TeamMemberDesignation } from "@prisma/client";
import { prisma } from "@/lib/db";
import { storeUploadedFile } from "@/lib/uploads/store-file";

export type TeamMemberInput = {
  fullName: string;
  designation: TeamMemberDesignation;
  qualification?: string;
  displayOrder?: number;
};

const memberInclude = {
  photoFile: { select: { id: true, storageKey: true, originalFilename: true } },
} as const;

export async function listTeamMembersAdmin(options?: { q?: string }) {
  const q = options?.q?.trim();
  return prisma.teamMember.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { qualification: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ displayOrder: "asc" }, { fullName: "asc" }],
    include: memberInclude,
  });
}

export async function getTeamMemberAdmin(id: string) {
  return prisma.teamMember.findUnique({ where: { id }, include: memberInclude });
}

export async function createTeamMember(input: TeamMemberInput, photo?: File | null) {
  let photoFileId: string | undefined;
  if (photo && photo.size > 0) {
    const stored = await storeUploadedFile(photo, "team/photos");
    photoFileId = stored.id;
  }

  return prisma.teamMember.create({
    data: {
      fullName: input.fullName.trim(),
      designation: input.designation,
      qualification: input.qualification?.trim() || null,
      photoFileId: photoFileId ?? null,
      displayOrder: input.displayOrder ?? 0,
    },
    include: memberInclude,
  });
}

export async function updateTeamMember(
  id: string,
  input: Partial<TeamMemberInput>,
  photo?: File | null,
  removePhoto?: boolean,
) {
  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) throw new Error("Team member not found");

  let photoFileId = existing.photoFileId;
  if (removePhoto) photoFileId = null;
  if (photo && photo.size > 0) {
    const stored = await storeUploadedFile(photo, "team/photos");
    photoFileId = stored.id;
  }

  return prisma.teamMember.update({
    where: { id },
    data: {
      ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : {}),
      ...(input.designation !== undefined ? { designation: input.designation } : {}),
      ...(input.qualification !== undefined
        ? { qualification: input.qualification?.trim() || null }
        : {}),
      photoFileId,
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
    },
    include: memberInclude,
  });
}

export async function deleteTeamMember(id: string) {
  return prisma.teamMember.delete({ where: { id } });
}