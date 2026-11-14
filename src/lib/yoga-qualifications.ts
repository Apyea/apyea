import { prisma } from "@/lib/db";
import { instituteNameError } from "@/lib/validation";

export const YOGA_QUALIFICATION_OTHERS_CODE = "OTHERS";

const PASSING_YEAR_RANGE = 50;

export function passingYearOptions(range = PASSING_YEAR_RANGE): number[] {
  const endYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = endYear; y >= endYear - (range - 1); y--) years.push(y);
  return years;
}

export function passingYearBounds(range = PASSING_YEAR_RANGE) {
  const endYear = new Date().getFullYear();
  return { minYear: endYear - (range - 1), maxYear: endYear };
}

export type YogaQualificationRowInput = {
  yogaQualificationLevelId: string;
  institutionName: string;
  yearOfCompletion: number;
  otherText?: string;
};

type YogaLevelMeta = { id: string; code: string; sortOrder: number };

export function normalizeYogaQualificationRows(
  rows: YogaQualificationRowInput[] | undefined,
): YogaQualificationRowInput[] {
  if (!rows?.length) return [];
  return rows
    .map((r) => ({
      yogaQualificationLevelId: String(r.yogaQualificationLevelId ?? "").trim(),
      institutionName: String(r.institutionName ?? "").trim(),
      yearOfCompletion: Number(r.yearOfCompletion),
      otherText: String(r.otherText ?? "").trim() || undefined,
    }))
    .filter(
      (r) =>
        r.yogaQualificationLevelId.length > 0 ||
        r.institutionName.length > 0 ||
        r.yearOfCompletion > 0,
    );
}

export function validateYogaQualificationRowsStructure(rows: YogaQualificationRowInput[]) {
  if (!rows.length) {
    throw new Error("Add at least one yoga qualification");
  }
  const { minYear, maxYear } = passingYearBounds();
  for (const row of rows) {
    if (!row.yogaQualificationLevelId) {
      throw new Error("Select a qualification level for each row");
    }
    const instituteErr = instituteNameError(row.institutionName);
    if (instituteErr) throw new Error(instituteErr);
    if (
      !Number.isFinite(row.yearOfCompletion) ||
      row.yearOfCompletion < minYear ||
      row.yearOfCompletion > maxYear
    ) {
      throw new Error("Select a valid year of passing for each qualification");
    }
  }
}

export function pickHighestQualificationRow(
  rows: YogaQualificationRowInput[],
  levelsById: Map<string, YogaLevelMeta>,
): YogaQualificationRowInput {
  let bestSort = -1;
  let bestYear = -1;
  let best: YogaQualificationRowInput = rows[0]!;

  for (const row of rows) {
    const level = levelsById.get(row.yogaQualificationLevelId);
    if (!level) continue;
    const sort = level.sortOrder;
    const year = row.yearOfCompletion;
    if (sort > bestSort || (sort === bestSort && year > bestYear)) {
      bestSort = sort;
      bestYear = year;
      best = row;
    }
  }
  return best;
}

export async function resolveYogaQualificationRows(body: {
  yogaQualifications?: YogaQualificationRowInput[];
}) {
  const yogaQualifications = normalizeYogaQualificationRows(body.yogaQualifications);
  validateYogaQualificationRowsStructure(yogaQualifications);

  const levels = await prisma.yogaQualificationLevel.findMany({
    where: { id: { in: yogaQualifications.map((r) => r.yogaQualificationLevelId) } },
    select: { id: true, code: true, sortOrder: true },
  });
  const levelsById = new Map(levels.map((l) => [l.id, l]));

  for (const row of yogaQualifications) {
    const level = levelsById.get(row.yogaQualificationLevelId);
    if (!level) {
      throw new Error("Invalid yoga qualification level");
    }
    if (level.code === YOGA_QUALIFICATION_OTHERS_CODE && !row.otherText?.trim()) {
      throw new Error("Please specify your qualification (Others)");
    }
  }

  const highest = pickHighestQualificationRow(yogaQualifications, levelsById);
  const highestLevel = levelsById.get(highest.yogaQualificationLevelId)!;

  return {
    yogaQualifications,
    highestYogaQualificationLevelId: highest.yogaQualificationLevelId,
    highestInstitutionName: highest.institutionName,
    highestYearOfCompletion: highest.yearOfCompletion,
    highestYogaQualificationOtherText:
      highestLevel.code === YOGA_QUALIFICATION_OTHERS_CODE
        ? highest.otherText?.trim() ?? null
        : null,
  };
}

/** Hydrate repeatable rows from stored survey (admin edit). */
export function yogaQualificationRowsFromStored(source: {
  yogaQualifications?: Array<{
    yogaQualificationLevelId: string;
    institutionName: string;
    yearOfCompletion: number;
    otherText: string | null;
  }>;
  highestYogaQualificationLevelId?: string;
  primaryInstitutionName?: string;
  primaryYearOfCompletion?: number;
  highestYogaQualificationOtherText?: string | null;
}): YogaQualificationRowInput[] {
  if (source.yogaQualifications?.length) {
    return source.yogaQualifications.map((q) => ({
      yogaQualificationLevelId: q.yogaQualificationLevelId,
      institutionName: q.institutionName,
      yearOfCompletion: q.yearOfCompletion,
      otherText: q.otherText ?? undefined,
    }));
  }
  if (source.highestYogaQualificationLevelId) {
    return [
      {
        yogaQualificationLevelId: source.highestYogaQualificationLevelId,
        institutionName: source.primaryInstitutionName?.trim() ?? "",
        yearOfCompletion: source.primaryYearOfCompletion ?? 0,
        otherText: source.highestYogaQualificationOtherText ?? undefined,
      },
    ];
  }
  return [];
}
