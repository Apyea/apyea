import { prisma } from "@/lib/db";
import { teamDesignationLabel } from "@/lib/team/options";

export const teamMemberPublicSelect = {
  id: true,
  fullName: true,
  designation: true,
  qualification: true,
  displayOrder: true,
  photoFile: { select: { storageKey: true } },
} as const;

export function photoUrlFromStorageKey(storageKey: string | undefined | null) {
  if (!storageKey) return null;
  return `/api/files/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export function toPublicTeamMember(
  row: Awaited<ReturnType<typeof listPublicTeamMembers>>[number],
) {
  return {
    id: row.id,
    fullName: row.fullName,
    qualification: row.qualification,
    displayOrder: row.displayOrder,
    photoUrl: photoUrlFromStorageKey(row.photoFile?.storageKey),
    designation: {
      code: row.designation,
      name: teamDesignationLabel(row.designation),
    },
  };
}

export async function listPublicTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: [{ displayOrder: "asc" }, { fullName: "asc" }],
    select: teamMemberPublicSelect,
  });
}