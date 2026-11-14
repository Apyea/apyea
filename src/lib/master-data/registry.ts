import { prisma } from "@/lib/db";
import type { MasterResource } from "@/lib/master-data/resources";

export type { MasterResource } from "@/lib/master-data/resources";
export { MASTER_RESOURCES, isMasterResource } from "@/lib/master-data/resources";

type ListOptions = { parentId?: string; includeInactive?: boolean };

export async function listMaster(resource: MasterResource, options: ListOptions = {}) {
  const activeOnly = !options.includeInactive;

  switch (resource) {
    case "genders":
      return prisma.gender.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "nationalities":
      return prisma.nationality.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "states":
      return prisma.state.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "districts":
      return prisma.district.findMany({
        where: {
          ...(activeOnly ? { isActive: true } : {}),
          ...(options.parentId ? { stateId: options.parentId } : {}),
        },
        orderBy: { sortOrder: "asc" },
        include: options.parentId ? undefined : { state: { select: { name: true, code: true } } },
      });
    case "mandals":
      return prisma.mandal.findMany({
        where: {
          ...(activeOnly ? { isActive: true } : {}),
          ...(options.parentId ? { districtId: options.parentId } : {}),
        },
        orderBy: { sortOrder: "asc" },
        include: options.parentId
          ? undefined
          : { district: { select: { name: true, stateId: true } } },
      });
    case "yoga-qualification-levels":
      return prisma.yogaQualificationLevel.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "yoga-professional-types":
      return prisma.yogaProfessionalType.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "employment-statuses":
      return prisma.employmentStatus.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "gov-work-interest-options":
      return prisma.govWorkInterestOption.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "volunteer-responses":
      return prisma.volunteerResponse.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "lecture-languages":
      return prisma.lectureLanguage.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "employment-preference-types":
      return prisma.employmentPreferenceType.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    case "professional-challenge-types":
      return prisma.professionalChallengeType.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
    default:
      throw new Error(`Unknown resource: ${resource satisfies never}`);
  }
}

export async function createMaster(resource: MasterResource, body: Record<string, unknown>) {
  const code = String(body.code ?? "").trim();
  const label = String(body.label ?? body.name ?? "").trim();
  if (!code || !label) {
    throw new Error("code and label (or name) are required");
  }
  const sortOrder = Number(body.sortOrder ?? 0);
  const isActive = body.isActive !== false;

  switch (resource) {
    case "genders":
      return prisma.gender.create({ data: { code, label, sortOrder, isActive } });
    case "nationalities":
      return prisma.nationality.create({ data: { code, label, sortOrder, isActive } });
    case "states":
      return prisma.state.create({ data: { code, name: label, sortOrder, isActive } });
    case "districts": {
      const stateId = String(body.stateId ?? "");
      if (!stateId) throw new Error("stateId is required");
      return prisma.district.create({
        data: { stateId, name: label, sortOrder, isActive },
      });
    }
    case "mandals": {
      const districtId = String(body.districtId ?? "");
      if (!districtId) throw new Error("districtId is required");
      return prisma.mandal.create({
        data: { districtId, name: label, sortOrder, isActive },
      });
    }
    case "yoga-qualification-levels":
      return prisma.yogaQualificationLevel.create({ data: { code, label, sortOrder, isActive } });
    case "yoga-professional-types":
      return prisma.yogaProfessionalType.create({ data: { code, label, sortOrder, isActive } });
    case "employment-statuses":
      return prisma.employmentStatus.create({ data: { code, label, sortOrder, isActive } });
    case "gov-work-interest-options":
      return prisma.govWorkInterestOption.create({ data: { code, label, sortOrder, isActive } });
    case "volunteer-responses":
      return prisma.volunteerResponse.create({ data: { code, label, sortOrder, isActive } });
    case "lecture-languages":
      return prisma.lectureLanguage.create({ data: { code, label, sortOrder, isActive } });
    case "employment-preference-types":
      return prisma.employmentPreferenceType.create({ data: { code, label, sortOrder, isActive } });
    case "professional-challenge-types":
      return prisma.professionalChallengeType.create({ data: { code, label, sortOrder, isActive } });
    default:
      throw new Error(`Unknown resource: ${resource satisfies never}`);
  }
}

export async function updateMaster(
  resource: MasterResource,
  id: string,
  body: Record<string, unknown>,
) {
  const data: Record<string, unknown> = {};
  if (body.label !== undefined) data.label = String(body.label);
  if (body.name !== undefined) data.name = String(body.name);
  if (body.code !== undefined) data.code = String(body.code);
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (body.stateId !== undefined) data.stateId = String(body.stateId);
  if (body.districtId !== undefined) data.districtId = String(body.districtId);

  switch (resource) {
    case "genders":
      return prisma.gender.update({ where: { id }, data });
    case "nationalities":
      return prisma.nationality.update({ where: { id }, data });
    case "states":
      return prisma.state.update({ where: { id }, data });
    case "districts":
      return prisma.district.update({ where: { id }, data });
    case "mandals":
      return prisma.mandal.update({ where: { id }, data });
    case "yoga-qualification-levels":
      return prisma.yogaQualificationLevel.update({ where: { id }, data });
    case "yoga-professional-types":
      return prisma.yogaProfessionalType.update({ where: { id }, data });
    case "employment-statuses":
      return prisma.employmentStatus.update({ where: { id }, data });
    case "gov-work-interest-options":
      return prisma.govWorkInterestOption.update({ where: { id }, data });
    case "volunteer-responses":
      return prisma.volunteerResponse.update({ where: { id }, data });
    case "lecture-languages":
      return prisma.lectureLanguage.update({ where: { id }, data });
    case "employment-preference-types":
      return prisma.employmentPreferenceType.update({ where: { id }, data });
    case "professional-challenge-types":
      return prisma.professionalChallengeType.update({ where: { id }, data });
    default:
      throw new Error(`Unknown resource: ${resource satisfies never}`);
  }
}

export async function deleteMaster(resource: MasterResource, id: string) {
  switch (resource) {
    case "genders":
      return prisma.gender.delete({ where: { id } });
    case "nationalities":
      return prisma.nationality.delete({ where: { id } });
    case "states": {
      const districts = await prisma.district.findMany({
        where: { stateId: id },
        select: { id: true },
      });
      for (const district of districts) {
        await prisma.mandal.deleteMany({ where: { districtId: district.id } });
      }
      await prisma.district.deleteMany({ where: { stateId: id } });
      return prisma.state.delete({ where: { id } });
    }
    case "districts": {
      await prisma.mandal.deleteMany({ where: { districtId: id } });
      return prisma.district.delete({ where: { id } });
    }
    case "mandals":
      return prisma.mandal.delete({ where: { id } });
    case "yoga-qualification-levels":
      return prisma.yogaQualificationLevel.delete({ where: { id } });
    case "yoga-professional-types":
      return prisma.yogaProfessionalType.delete({ where: { id } });
    case "employment-statuses":
      return prisma.employmentStatus.delete({ where: { id } });
    case "gov-work-interest-options":
      return prisma.govWorkInterestOption.delete({ where: { id } });
    case "volunteer-responses":
      return prisma.volunteerResponse.delete({ where: { id } });
    case "lecture-languages":
      return prisma.lectureLanguage.delete({ where: { id } });
    case "employment-preference-types":
      return prisma.employmentPreferenceType.delete({ where: { id } });
    case "professional-challenge-types":
      return prisma.professionalChallengeType.delete({ where: { id } });
    default:
      throw new Error(`Unknown resource: ${resource satisfies never}`);
  }
}

export async function getMasterBundleForForm() {
  const [
    genders,
    nationalities,
    states,
    yogaQualificationLevels,
    yogaProfessionalTypes,
    employmentStatuses,
    govWorkInterestOptions,
    volunteerResponses,
    lectureLanguages,
    employmentPreferenceTypes,
    professionalChallengeTypes,
  ] = await Promise.all([
    listMaster("genders"),
    listMaster("nationalities"),
    listMaster("states"),
    listMaster("yoga-qualification-levels"),
    listMaster("yoga-professional-types"),
    listMaster("employment-statuses"),
    listMaster("gov-work-interest-options"),
    listMaster("volunteer-responses"),
    listMaster("lecture-languages"),
    listMaster("employment-preference-types"),
    listMaster("professional-challenge-types"),
  ]);

  return {
    genders,
    nationalities,
    states,
    yogaQualificationLevels,
    yogaProfessionalTypes,
    employmentStatuses,
    govWorkInterestOptions,
    volunteerResponses,
    lectureLanguages,
    employmentPreferenceTypes,
    professionalChallengeTypes,
  };
}
